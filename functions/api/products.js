const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet(context) {
  try {
    const { env } = context;

    // 1. If Cloudflare KV is bound in Pages:
    if (env && env.PRODUCTS_KV) {
      const data = await env.PRODUCTS_KV.get('xylem_products', { type: 'json' });
      if (data && Array.isArray(data.books)) {
        return new Response(JSON.stringify({ success: true, ...data }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            ...CORS_HEADERS,
          },
        });
      }
    }

    // 2. Fetch live products from Cloudinary raw CDN:
    const cloudName = (env && env.CLOUDINARY_CLOUD_NAME) || 'gog1fpsj';
    const rawUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/xylem_products_live.json?t=${Date.now()}`;
    const res = await fetch(rawUrl);

    if (res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, ...data }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...CORS_HEADERS,
        },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'No remote catalog initialized yet' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
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
    const books = payload.books || [];
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
    }

    // 2. Store to Cloudinary raw storage for global real-time synchronization
    const publicId = 'xylem_products_live';
    const paramsToSign = `overwrite=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const uploadData = new FormData();
    const blob = new Blob([JSON.stringify(updatedCatalog)], { type: 'application/json' });
    uploadData.append('file', blob, 'products.json');
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp.toString());
    uploadData.append('public_id', publicId);
    uploadData.append('overwrite', 'true');
    uploadData.append('signature', signature);

    const cRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: uploadData,
    });

    const cResult = await cRes.json();

    if (!cRes.ok) {
      return new Response(JSON.stringify({ error: cResult.error?.message || 'Cloudinary save failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        version: timestamp,
        updatedAt: updatedCatalog.updatedAt,
        cloudinaryUrl: cResult.secure_url,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
}
