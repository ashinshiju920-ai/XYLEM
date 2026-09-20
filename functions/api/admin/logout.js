// functions/api/admin/logout.js

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

export async function onRequestPost() {
  // Clear admin_session cookie immediately
  const cookieVal = 'admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0';

  return new Response(
    JSON.stringify({ success: true, message: 'Logged out' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieVal,
        ...CORS_HEADERS,
      },
    }
  );
}
