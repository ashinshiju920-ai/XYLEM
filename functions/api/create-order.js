// functions/api/create-order.js

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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
    const body = await request.json();

    const { 
      productId, 
      productTitle, 
      price, 
      customerName, 
      customerEmail, 
      customerPhone 
    } = body;

    // Validate required fields
    if (!productId || price === undefined || !customerEmail || !customerPhone) {
      return new Response(JSON.stringify({ error: "Missing required checkout parameters." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }

    const appId = (env && env.CASHFREE_APP_ID) || 'TEST11209472dd30f3ef7cd2cce52d1f27490211';
    const secretKey = env && env.CASHFREE_SECRET_KEY;
    const isProd = (env && env.CASHFREE_ENV === "PRODUCTION");
    const cashfreeUrl = (env && env.CASHFREE_BASE_URL) || (isProd
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders");

    if (!secretKey) {
      return new Response(JSON.stringify({ error: "CASHFREE_SECRET_KEY is not configured in Cloudflare Pages environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }

    // Generate unique order ID
    const uniqueOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Set the exact target URL provided
    const postPaymentRedirectUrl = "https://portal.xylemlearning.online/";

    const orderPayload = {
      order_id: uniqueOrderId,
      order_amount: Number(price), // Matches the exact checkout button price
      order_currency: "INR",
      customer_details: {
        customer_id: customerEmail.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40),
        customer_name: customerName || "Student / Customer",
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${postPaymentRedirectUrl}?order_id={order_id}&status={order_status}`
      },
      order_tags: {
        product_id: productId,
        product_title: productTitle || "Course Material"
      }
    };

    // Server-to-Server call using Cloudflare Environment Variables
    const cfResponse = await fetch(cashfreeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await cfResponse.json();

    if (!cfResponse.ok) {
      return new Response(JSON.stringify({ error: data.message || "Cashfree order generation failed.", details: data }), {
        status: cfResponse.status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }

    return new Response(JSON.stringify({
      paymentSessionId: data.payment_session_id,
      orderId: uniqueOrderId,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS }
    });
  }
}
