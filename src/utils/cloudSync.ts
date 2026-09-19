import { Book } from '../types';

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
 * so every user globally gets the latest product changes and image updates in real time.
 */
export async function saveCatalogToCloud(
  books: Book[]
): Promise<{ success: boolean; version?: number; error?: string }> {
  const timestamp = Math.round(Date.now() / 1000);
  const payload = {
    version: timestamp,
    updatedAt: new Date().toISOString(),
    count: books.length,
    books,
  };

  // Broadcast instantly to all other open tabs on this browser
  broadcastLocalUpdate(books, timestamp);

  // 1. Try Cloudflare Pages edge endpoint /api/products
  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ books }),
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

  // 2. Direct Cloudinary raw upload fallback
  try {
    const paramsToSign = `overwrite=true&public_id=${PUBLIC_CATALOG_ID}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const uploadData = new FormData();
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    uploadData.append('file', blob, 'products.json');
    uploadData.append('api_key', CLOUDINARY_API_KEY);
    uploadData.append('timestamp', timestamp.toString());
    uploadData.append('public_id', PUBLIC_CATALOG_ID);
    uploadData.append('overwrite', 'true');
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
 * Fetches the latest live product catalog from Cloudflare Edge or Cloudinary CDN.
 */
export async function fetchCatalogFromCloud(): Promise<{
  books: Book[];
  version?: number;
  updatedAt?: string;
} | null> {
  // 1. Try Cloudflare Pages /api/products
  try {
    const res = await fetch(`/api/products?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.books) && data.books.length > 0) {
        return {
          books: data.books,
          version: data.version,
          updatedAt: data.updatedAt,
        };
      }
    }
  } catch {
    // Continue to Cloudinary fallback
  }

  // 2. Direct Cloudinary raw CDN fallback
  try {
    const rawUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/raw/upload/${PUBLIC_CATALOG_ID}.json?t=${Date.now()}`;
    const cRes = await fetch(rawUrl, { cache: 'no-store' });
    if (cRes.ok) {
      const data = await cRes.json();
      if (data && Array.isArray(data.books) && data.books.length > 0) {
        return {
          books: data.books,
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
 * Multi-tab instant synchronization helper using BroadcastChannel.
 */
function broadcastLocalUpdate(books: Book[], version: number) {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: 'CATALOG_UPDATED', books, version, timestamp: Date.now() });
      bc.close();
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }
}

/**
 * Subscribes to real-time updates broadcast across tabs.
 */
export function subscribeToRealtimeBroadcast(
  onUpdate: (books: Book[], version: number) => void
): () => void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return () => {};
  }

  try {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (event) => {
      if (event.data && event.data.type === 'CATALOG_UPDATED' && Array.isArray(event.data.books)) {
        onUpdate(event.data.books, event.data.version || Date.now());
      }
    };
    return () => {
      bc.close();
    };
  } catch (e) {
    console.warn('Could not initialize BroadcastChannel listener:', e);
    return () => {};
  }
}
