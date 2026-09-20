// functions/api/admin/session.js
import { verifySessionToken } from '../../utils/auth.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const secret = env?.ADMIN_SESSION_SECRET || env?.ADMIN_PASSWORD_HASH;

  if (!secret) {
    return new Response(
      JSON.stringify({ authenticated: false }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }

  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf('=');
        if (idx === -1) return [c, ''];
        return [c.slice(0, idx).trim(), c.slice(idx + 1).trim()];
      })
  );

  const token = cookies['admin_session'];
  if (!token) {
    return new Response(
      JSON.stringify({ authenticated: false }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      }
    );
  }

  const session = await verifySessionToken(token, secret);
  const isAuthenticated = Boolean(session && session.role === 'admin');

  return new Response(
    JSON.stringify({ authenticated: isAuthenticated }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    }
  );
}
