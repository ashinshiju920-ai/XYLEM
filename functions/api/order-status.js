// functions/api/order-status.js
// Server-Side Cashfree Order Verification & Fulfillment Gate

import { getOrder, updateOrderStatus, issuePaidFulfillmentLinks } from '../utils/db.js';

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
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id') || url.searchParams.get('orderId');

    if (!orderId || typeof orderId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing order_id parameter.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const cleanOrderId = orderId.trim();

    // 1. Look up order in D1 / KV
    let order = await getOrder(env, cleanOrderId);

    if (!order) {
      return new Response(
        JSON.stringify({
          status: 'NOT_FOUND',
          orderId: cleanOrderId,
          items: [],
          error: 'Order not found in database.',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // 2. If status is not yet PAID, query Cashfree Get Order API server-side
    const secretKey = env && env.CASHFREE_SECRET_KEY ? String(env.CASHFREE_SECRET_KEY).trim() : '';
    const appId = env && env.CASHFREE_APP_ID ? String(env.CASHFREE_APP_ID).trim() : '';

    if (order.status !== 'PAID' && secretKey && appId) {
      try {
        const configuredEnv = env && env.CASHFREE_ENV ? String(env.CASHFREE_ENV).trim().toUpperCase() : '';
        const isProd = secretKey.startsWith('cfsk_ma_prod_') || configuredEnv === 'PRODUCTION';
        const baseUrl = (env && env.CASHFREE_BASE_URL) || (isProd
          ? 'https://api.cashfree.com/pg/orders'
          : 'https://sandbox.cashfree.com/pg/orders');

        const cfOrderId = order.cf_order_id || order.id;
        const cfRes = await fetch(`${baseUrl}/${encodeURIComponent(cfOrderId)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': appId,
            'x-client-secret': secretKey,
          },
        });

        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData && cfData.order_status === 'PAID') {
            const paidPaise = Math.round(Number(cfData.order_amount) * 100);
            if (Math.abs(order.amount_paise - paidPaise) <= 1) {
              await updateOrderStatus(env, order.id, 'PAID');
              order.status = 'PAID';
            }
          }
        }
      } catch (cfFetchErr) {
        console.warn('Could not query Cashfree order status:', cfFetchErr.message);
      }
    }

    // 3. Return ONLY verified, non-internal fields
    if (order.status === 'PAID') {
      const fulfillment = issuePaidFulfillmentLinks(order);
      return new Response(
        JSON.stringify({
          status: 'PAID',
          orderId: order.id,
          items: order.items || [],
          fulfillment, // Server-issued download links & copy URL
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          total: Math.round(order.amount_paise / 100),
          currency: order.currency || 'INR',
          date: order.created_at,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    // Pending or unpaid order: return status with NO fulfillment links
    return new Response(
      JSON.stringify({
        status: order.status || 'PENDING',
        orderId: order.id,
        items: order.items || [],
        total: Math.round(order.amount_paise / 100),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal error retrieving order status.' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
    );
  }
}
