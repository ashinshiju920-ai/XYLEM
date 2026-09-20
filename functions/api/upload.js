import { requireAdmin } from '../utils/auth.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const cloudName = env?.CLOUDINARY_CLOUD_NAME;
    const apiKey = env?.CLOUDINARY_API_KEY;
    const apiSecret = env?.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Cloudinary credentials in environment' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('image');
    const productId = formData.get('productId') || 'unassigned';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'ecommerce_products';

    // Cloudinary signature generation (SHA-1 over alphabetical key=value pairs)
    const paramsToSign = `folder=${folder}&public_id=product_${productId}_${timestamp}&timestamp=${timestamp}${apiSecret}`;
    
    // Web Crypto SHA-1 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Prepare payload for Cloudinary REST API
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('api_key', apiKey);
    uploadData.append('timestamp', timestamp.toString());
    uploadData.append('folder', folder);
    uploadData.append('public_id', `product_${productId}_${timestamp}`);
    uploadData.append('signature', signature);

    // Direct upload call from Cloudflare Edge to Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadData,
      }
    );

    const result = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok) {
      return new Response(JSON.stringify({ error: result.error?.message || 'Upload failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        productId: productId,
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
