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

    const secretKey = (env && env.CASHFREE_SECRET_KEY ? String(env.CASHFREE_SECRET_KEY).trim() : '');
    const appId = (env && env.CASHFREE_APP_ID ? String(env.CASHFREE_APP_ID).trim() : '') || 'TEST11209472dd30f3ef7cd2cce52d1f27490211';
    const configuredEnv = (env && env.CASHFREE_ENV ? String(env.CASHFREE_ENV).trim().toUpperCase() : '');

    if (!secretKey) {
      return new Response(JSON.stringify({ error: "CASHFREE_SECRET_KEY is not configured in Cloudflare Pages environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }

    // Auto-detect Production vs Sandbox:
    // - Secret key starting with 'cfsk_ma_prod_' is 100% PRODUCTION
    // - Secret key starting with 'cfsk_ma_test_' or App ID starting with 'TEST' is SANDBOX
    // - Otherwise fall back to CASHFREE_ENV setting
    let isProd = false;
    if (secretKey.startsWith('cfsk_ma_prod_')) {
      isProd = true;
    } else if (secretKey.startsWith('cfsk_ma_test_') || appId.toUpperCase().startsWith('TEST')) {
      isProd = false;
    } else {
      isProd = (configuredEnv === 'PRODUCTION');
    }

    const cashfreeUrl = (env && env.CASHFREE_BASE_URL) || (isProd
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders");

    // Generate unique order ID
    const uniqueOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Set the exact target URL provided
    const postPaymentRedirectUrl = "https://portal.xylemlearning.online/";

    const cleanPhone = String(customerPhone).replace(/[^0-9]/g, '').slice(-10) || '9876543210';
    const cleanEmail = String(customerEmail).trim();
    const cleanName = String(customerName || 'Student / Customer').trim();

    const orderPayload = {
      order_id: uniqueOrderId,
      order_amount: Number(price), // Matches the exact checkout button price
      order_currency: "INR",
      customer_details: {
        customer_id: cleanEmail.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40) || `cust_${cleanPhone}`,
        customer_name: cleanName,
        customer_email: cleanEmail,
        customer_phone: cleanPhone
      },
      order_meta: {
        return_url: `${postPaymentRedirectUrl}?order_id={order_id}&status={order_status}`
      },
      order_tags: {
        product_id: String(productId),
        product_title: (productTitle || "Course Material").slice(0, 50)
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

    if (!cfResponse.ok || !data.payment_session_id) {
      console.error('Cashfree order generation error:', data);
      return new Response(JSON.stringify({ 
        error: data.message || data.error || "Cashfree order generation failed.", 
        details: data,
        environment: isProd ? 'production' : 'sandbox',
        targetUrl: cashfreeUrl
      }), {
        status: cfResponse.status || 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      paymentSessionId: data.payment_session_id,
      payment_session_id: data.payment_session_id,
      orderId: uniqueOrderId,
      order_id: uniqueOrderId,
      orderAmount: data.order_amount || Number(price),
      orderCurrency: data.order_currency || "INR",
      environment: isProd ? 'production' : 'sandbox',
      isProd
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
