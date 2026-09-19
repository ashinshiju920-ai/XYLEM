import { Book, ExamPath, Testimonial } from '../types';

const CLOUDINARY_CLOUD_NAME = 'gog1fpsj';
const CLOUDINARY_API_KEY = '493453349916754';
const CLOUDINARY_API_SECRET = 'sEAo0K6H8eWpJOacv4Eo_YuaMvw';
const PUBLIC_CATALOG_ID = 'xylem_products_live';

const CHANNEL_NAME = 'xylem_products_realtime_sync';

/**
 * Uploads an image file directly to Cloudinary via Cloudflare Pages edge /api/upload
 * with automatic client-side Web Crypto fallback for local development.
 */
export async function uploadImageToCloudinary(file: File, productId: string): Promise<string> {
  const cleanSku = productId.trim() || 'unassigned';
  const formData = new FormData();
  formData.append('image', file);
  formData.append('productId', cleanSku);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      }
    }
  } catch (err) {
    console.warn('Edge /api/upload unavailable, using direct Cloudinary upload:', err);
  }

  // Fallback: Direct Web Crypto SHA-1 upload to Cloudinary REST API
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'ecommerce_products';
  const publicId = `product_${cleanSku}_${timestamp}`;
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(paramsToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  const directData = new FormData();
  directData.append('file', file);
  directData.append('api_key', CLOUDINARY_API_KEY);
  directData.append('timestamp', timestamp.toString());
  directData.append('folder', folder);
  directData.append('public_id', publicId);
  directData.append('signature', signature);

  const directRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: directData,
    }
  );

  const directJson = await directRes.json();
  if (directRes.ok && directJson.secure_url) {
    return directJson.secure_url;
  }

  throw new Error(directJson.error?.message || 'Failed to upload image to Cloudinary');
}

/**
 * Saves the entire books catalog to the cloud (Cloudflare Pages KV / Cloudinary Raw CDN)
 * with instant cache invalidation and zero-lag cross-tab broadcast.
 */
export async function saveCatalogToCloud(
  books: Book[],
  examPaths?: ExamPath[],
  testimonials?: Testimonial[]
): Promise<{ success: boolean; version?: number; error?: string }> {
  const timestamp = Math.round(Date.now() / 1000);
  const payload: any = {
    version: timestamp,
    updatedAt: new Date().toISOString(),
    count: books.length,
    books,
    ...(examPaths ? { examPaths } : {}),
    ...(testimonials ? { testimonials } : {}),
  };

  // 1. Instant 0ms broadcast to all open tabs & windows on this machine
  broadcastLocalUpdate(books, timestamp, examPaths, testimonials);

  // 2. Try Cloudflare Pages edge endpoint /api/products
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ books, examPaths, testimonials }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true, version: data.version || timestamp };
      }
    }
  } catch (err) {
    console.warn('Edge /api/products failed, falling back to direct Cloudinary sync:', err);
  }

  // 3. Direct Cloudinary raw upload fallback with instant CDN invalidation
  try {
    const paramsToSign = `invalidate=true&overwrite=true&public_id=${PUBLIC_CATALOG_ID}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const uploadData = new FormData();
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    uploadData.append('file', blob, 'xylem_products_live.json');
    uploadData.append('api_key', CLOUDINARY_API_KEY);
    uploadData.append('timestamp', timestamp.toString());
    uploadData.append('public_id', PUBLIC_CATALOG_ID);
    uploadData.append('overwrite', 'true');
    uploadData.append('invalidate', 'true');
    uploadData.append('signature', signature);

    const cRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
      {
        method: 'POST',
        body: uploadData,
      }
    );

    const cResult = await cRes.json();
    if (cRes.ok && cResult.secure_url) {
      return { success: true, version: timestamp };
    }

    return {
      success: false,
      error: cResult.error?.message || 'Could not sync catalog to Cloudinary',
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Updates a single product's image across the live cloud catalog in real time.
 */
export async function updateProductImageLive(
  productId: string,
  imageUrl: string
): Promise<{ success: boolean; version?: number; error?: string }> {
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update-product-image',
        productId,
        imageUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.books)) {
        broadcastLocalUpdate(data.books, data.version || Date.now());
        return { success: true, version: data.version };
      }
    }
  } catch {}

  // Fallback: fetch current, update locally, and push
  const current = await fetchCatalogFromCloud();
  if (current && Array.isArray(current.books)) {
    const nextBooks = current.books.map((b) => (b.id === productId ? { ...b, imageUrl } : b));
    return saveCatalogToCloud(nextBooks);
  }

  return { success: false, error: 'Could not update image in live catalog' };
}

/**
 * Checks for new catalog version in ~15ms without downloading the full catalog.
 */
export async function checkCatalogVersion(): Promise<number | null> {
  try {
    const res = await fetch(`/api/products?check=version&_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.version === 'number') {
        return data.version;
      }
    }
  } catch {}
  return null;
}

/**
 * Fetches the latest live product catalog from Cloudflare Edge or Cloudinary CDN.
 */
export async function fetchCatalogFromCloud(): Promise<{
  books: Book[];
  examPaths?: ExamPath[];
  testimonials?: Testimonial[];
  version?: number;
  updatedAt?: string;
} | null> {
  // 1. Try Cloudflare Pages /api/products
  try {
    const res = await fetch(`/api/products?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.books) && data.books.length > 0) {
        return {
          books: data.books,
          examPaths: Array.isArray(data.examPaths) ? data.examPaths : undefined,
          testimonials: Array.isArray(data.testimonials) ? data.testimonials : undefined,
          version: data.version,
          updatedAt: data.updatedAt,
        };
      }
    }
  } catch {
    // Continue to Cloudinary fallback
  }

  // 2. Direct Cloudinary raw CDN fallback with instant cache busting
  try {
    const rawUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/xylem_products_live.json?_t=${Date.now()}`;
    const cRes = await fetch(rawUrl, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' },
    });
    if (cRes.ok) {
      const data = await cRes.json();
      if (data && Array.isArray(data.books) && data.books.length > 0) {
        return {
          books: data.books,
          examPaths: Array.isArray(data.examPaths) ? data.examPaths : undefined,
          testimonials: Array.isArray(data.testimonials) ? data.testimonials : undefined,
          version: data.version,
          updatedAt: data.updatedAt,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch catalog from Cloudinary raw CDN:', err);
  }

  return null;
}

/**
 * Instant multi-tab & multi-window synchronization helper using BroadcastChannel + localStorage event.
 */
export function broadcastLocalUpdate(
  books: Book[],
  version: number,
  examPaths?: ExamPath[],
  testimonials?: Testimonial[]
) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('xylem_books_data', JSON.stringify(books));
    localStorage.setItem('xylem_books_version', String(version));
    if (examPaths) {
      localStorage.setItem('xylem_exam_paths_data', JSON.stringify(examPaths));
    }
    if (testimonials) {
      localStorage.setItem('xylem_testimonials_data', JSON.stringify(testimonials));
    }
  } catch {}

  if ('BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({
        type: 'CATALOG_UPDATED',
        books,
        examPaths,
        testimonials,
        version,
        timestamp: Date.now(),
      });
      bc.close();
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }
}

/**
 * Subscribes to real-time updates broadcast across tabs and windows.
 */
export function subscribeToRealtimeBroadcast(
  onUpdate: (
    books: Book[],
    version: number,
    examPaths?: ExamPath[],
    testimonials?: Testimonial[]
  ) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const cleanups: (() => void)[] = [];

  // 1. BroadcastChannel listener (0ms latency between tabs)
  if ('BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data && event.data.type === 'CATALOG_UPDATED' && Array.isArray(event.data.books)) {
          onUpdate(
            event.data.books,
            event.data.version || Date.now(),
            Array.isArray(event.data.examPaths) ? event.data.examPaths : undefined,
            Array.isArray(event.data.testimonials) ? event.data.testimonials : undefined
          );
        }
      };
      cleanups.push(() => bc.close());
    } catch (e) {
      console.warn('Could not initialize BroadcastChannel listener:', e);
    }
  }

  // 2. Storage event listener (fires instantly when another tab changes localStorage)
  const onStorage = (e: StorageEvent) => {
    if (
      (e.key === 'xylem_books_data' ||
        e.key === 'xylem_exam_paths_data' ||
        e.key === 'xylem_testimonials_data') &&
      e.newValue
    ) {
      try {
        const rawBooks = localStorage.getItem('xylem_books_data');
        const parsedBooks = rawBooks ? JSON.parse(rawBooks) : [];
        const rawPaths = localStorage.getItem('xylem_exam_paths_data');
        const parsedPaths = rawPaths ? JSON.parse(rawPaths) : undefined;
        const rawTestis = localStorage.getItem('xylem_testimonials_data');
        const parsedTestis = rawTestis ? JSON.parse(rawTestis) : undefined;

        if (Array.isArray(parsedBooks) && parsedBooks.length > 0) {
          const v = Number(localStorage.getItem('xylem_books_version')) || Date.now();
          onUpdate(parsedBooks, v, parsedPaths, parsedTestis);
        }
      } catch {}
    }
  };
  window.addEventListener('storage', onStorage);
  cleanups.push(() => window.removeEventListener('storage', onStorage));

  return () => {
    cleanups.forEach((c) => c());
  };
}
