const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, If-None-Match',
};

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Cloudflare-CDN-Cache-Control': 'no-store',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store',
  ...CORS_HEADERS,
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: NO_CACHE_HEADERS,
  });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const checkOnly = url.searchParams.get('check') === 'version';

    // 1. If Cloudflare KV is bound in Pages:
    if (env && env.PRODUCTS_KV) {
      if (checkOnly) {
        const version = await env.PRODUCTS_KV.get('xylem_products_version');
        if (version) {
          return new Response(JSON.stringify({ success: true, version: Number(version) }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
          });
        }
      }

      const data = await env.PRODUCTS_KV.get('xylem_products', { type: 'json' });
      if (data && Array.isArray(data.books)) {
        if (checkOnly) {
          return new Response(JSON.stringify({ success: true, version: data.version || 0, count: data.count || data.books.length }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
          });
        }
        return new Response(JSON.stringify({ success: true, ...data }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
        });
      }
    }

    // 2. Fetch live products from Cloudinary raw CDN with instant cache-busting:
    const cloudName = (env && env.CLOUDINARY_CLOUD_NAME) || 'gog1fpsj';
    const rawUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/xylem_products_live.json?_t=${Date.now()}`;
    const res = await fetch(rawUrl, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      if (checkOnly) {
        return new Response(JSON.stringify({ success: true, version: data.version || 0, count: data.count || data.books?.length || 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
        });
      }
      return new Response(JSON.stringify({ success: true, ...data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'No remote catalog initialized yet' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const cloudName = (env && env.CLOUDINARY_CLOUD_NAME) || 'gog1fpsj';
    const apiKey = (env && env.CLOUDINARY_API_KEY) || '493453349916754';
    const apiSecret = (env && env.CLOUDINARY_API_SECRET) || 'sEAo0K6H8eWpJOacv4Eo_YuaMvw';

    const payload = await request.json();
    let books = payload.books;

    // Handle single-product image update action directly
    if (payload.action === 'update-product-image' && payload.productId && payload.imageUrl) {
      let currentCatalog = null;
      if (env && env.PRODUCTS_KV) {
        currentCatalog = await env.PRODUCTS_KV.get('xylem_products', { type: 'json' });
      }
      if (!currentCatalog || !Array.isArray(currentCatalog.books)) {
        try {
          const cRes = await fetch(`https://res.cloudinary.com/${cloudName}/raw/upload/xylem_products_live.json?_t=${Date.now()}`, { cache: 'no-store' });
          if (cRes.ok) currentCatalog = await cRes.json();
        } catch {}
      }

      const existingBooks = (currentCatalog && Array.isArray(currentCatalog.books)) ? currentCatalog.books : [];
      const prodId = payload.productId.trim();
      const idx = existingBooks.findIndex(b => b.id === prodId || (b.title && b.title.toLowerCase().includes(prodId.toLowerCase())));

      if (idx !== -1) {
        existingBooks[idx] = { ...existingBooks[idx], imageUrl: payload.imageUrl };
      } else {
        existingBooks.push({
          id: prodId,
          title: payload.productTitle || prodId,
          subtitle: 'Official Preparation Guide',
          category: 'IELTS',
          type: 'Study Guides',
          imageUrl: payload.imageUrl,
          prices: { digital: { price: 199, originalPrice: 599, discountPercent: 67 }, physical: { price: 899, originalPrice: 1499, discountPercent: 40 } },
          features: ['Official Exam Syllabus 2026', 'Practice Questions & Solutions'],
          whatYouGet: ['Full Study Material', 'Lifetime Digital Access'],
          tableOfContents: [{ chapter: 'Chapter 1: Overview', pages: 'pp. 1-50' }],
        });
      }
      books = existingBooks;
    }

    if (!Array.isArray(books)) {
      books = [];
    }

    const timestamp = Math.round(Date.now() / 1000);
    const updatedCatalog = {
      version: timestamp,
      updatedAt: new Date().toISOString(),
      count: books.length,
      books,
    };

    // 1. If Cloudflare KV is bound:
    if (env && env.PRODUCTS_KV) {
      await env.PRODUCTS_KV.put('xylem_products', JSON.stringify(updatedCatalog));
      await env.PRODUCTS_KV.put('xylem_products_version', String(timestamp));
    }

    // 2. Store to Cloudinary raw storage with instant CDN invalidation
    const publicId = 'xylem_products_live';
    const paramsToSign = `invalidate=true&overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const uploadData = new FormData();
    const blob = new Blob([JSON.stringify(updatedCatalog)], { type: 'application/json' });
    uploadData.append('file', blob, 'xylem_products_live.json');
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp.toString());
    uploadData.append('public_id', publicId);
    uploadData.append('overwrite', 'true');
    uploadData.append('invalidate', 'true');
    uploadData.append('signature', signature);

    const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: uploadData,
    });

    const cResult = await cRes.json();

    if (!cRes.ok) {
      return new Response(JSON.stringify({ error: cResult.error?.message || 'Cloudinary save failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        version: timestamp,
        updatedAt: updatedCatalog.updatedAt,
        count: updatedCatalog.count,
        cloudinaryUrl: cResult.secure_url,
        books: updatedCatalog.books,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...NO_CACHE_HEADERS },
    });
  }
}
