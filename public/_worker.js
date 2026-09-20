// public/_worker.js
// Cloudflare Pages Advanced Mode Worker
// Intercepts API routes, integrates Cashfree payments, and serves static assets.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Cache-Control, Pragma, If-None-Match',
};

async function handleCreateCashfreeOrder(request, env) {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    const secretKey = (env && env.CASHFREE_SECRET_KEY ? String(env.CASHFREE_SECRET_KEY).trim() : '');
    const appId = (env && env.CASHFREE_APP_ID ? String(env.CASHFREE_APP_ID).trim() : '') || 'TEST11209472dd30f3ef7cd2cce52d1f27490211';
    const configuredEnv = (env && env.CASHFREE_ENV ? String(env.CASHFREE_ENV).trim().toUpperCase() : '');

    if (!secretKey) {
      return new Response(
        JSON.stringify({
          error: 'CASHFREE_SECRET_KEY is not configured in Cloudflare Pages environment variables.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
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
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders');

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const {
      cart = [],
      couponCode = null,
      shippingInfo = {},
      requestedAmount,
      productId,
      productTitle,
      price,
      customerName: directCustomerName,
      customerEmail: directCustomerEmail,
      customerPhone: directCustomerPhone,
      paymentMethod = 'upi',
    } = body;

    // Server-side price calculation
    let basePrice = 199;
    if (price !== undefined && Number(price) > 0) {
      basePrice = Number(price);
    } else if (Array.isArray(cart) && cart.length > 0) {
      const cartSubtotal = cart.reduce((sum, it) => {
        const itemPrice = Number(it.price) || (it.format === 'physical' ? 899 : 199);
        const qty = Number(it.quantity) || 1;
        return sum + itemPrice * qty;
      }, 0);
      if (cartSubtotal > 0) {
        basePrice = cartSubtotal;
      }
    } else if (typeof requestedAmount === 'number' && requestedAmount > 0) {
      basePrice = requestedAmount;
    }

    // Delivery fee
    const hasPhysical = Array.isArray(cart) && cart.some((it) => it.format === 'physical');
    const deliveryFee = hasPhysical && shippingInfo && shippingInfo.deliveryOption === 'physical' ? 99 : 0;

    // Coupon discount
    let discount = 0;
    if (couponCode) {
      const code = String(couponCode).trim().toUpperCase();
      if (code === 'XYLEM20') {
        discount = Math.round(basePrice * 0.20);
      } else if (code === 'FIRST50') {
        discount = Math.min(50, basePrice - 1);
      } else if (code === 'SPECIALOFFER' || code === 'OFFER67') {
        discount = Math.round(basePrice * 0.15);
      }
    }

    let finalAmount = Math.max(1, Math.round(basePrice + deliveryFee - discount));
    if (typeof requestedAmount === 'number' && requestedAmount > 0 && Math.abs(requestedAmount - finalAmount) <= 5) {
      finalAmount = requestedAmount;
    }

    const timestamp = Math.round(Date.now() / 1000);
    const orderId = `order_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;

    const rawName = (shippingInfo && shippingInfo.fullName && shippingInfo.fullName.trim()) || directCustomerName || 'Ashin Shiju';
    const rawEmail = (shippingInfo && shippingInfo.email && shippingInfo.email.trim()) || directCustomerEmail || 'student@xylemlearning.online';
    const rawPhone = (shippingInfo && shippingInfo.phone && shippingInfo.phone.replace(/[^0-9]/g, '')) || 
                     (directCustomerPhone && directCustomerPhone.replace(/[^0-9]/g, '')) || 
                     '9876543210';

    const customerPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : '9876543210';
    const customerId = `cust_${customerPhone}_${timestamp % 10000}`;

    const postPaymentRedirectUrl = 'https://portal.xylemlearning.online/';
    const returnUrl = `${postPaymentRedirectUrl}?order_id={order_id}&status={order_status}`;

    const cashfreePayload = {
      order_id: orderId,
      order_amount: finalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: rawName || 'Student / Customer',
        customer_email: rawEmail || 'student@xylemlearning.online',
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: returnUrl,
      },
      order_note: productTitle ? `Xylem - ${productTitle.slice(0, 40)}` : 'Xylem Learning - Complete Prep Study Materials',
    };

    if (productId) {
      cashfreePayload.order_tags = {
        product_id: String(productId),
        product_title: (productTitle || 'Course Material').slice(0, 50),
      };
    }

    const cfResponse = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(cashfreePayload),
    });

    const result = await cfResponse.json();

    if (!cfResponse.ok || !result.payment_session_id) {
      return new Response(
        JSON.stringify({
          error: result.message || result.error || 'Cashfree payment session initialization failed',
          details: result,
          environment: isProd ? 'production' : 'sandbox',
        }),
        {
          status: cfResponse.status || 500,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: result.order_id || orderId,
        orderId: result.order_id || orderId,
        payment_session_id: result.payment_session_id,
        paymentSessionId: result.payment_session_id,
        order_amount: result.order_amount || finalAmount,
        orderAmount: result.order_amount || finalAmount,
        order_currency: result.order_currency || 'INR',
        orderCurrency: result.order_currency || 'INR',
        environment: isProd ? 'production' : 'sandbox',
        isProd,
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

async function handleProducts(request, env) {
  try {
    const url = new URL(request.url);
    const cloudName = (env && env.CLOUDINARY_CLOUD_NAME) || 'gog1fpsj';
    const rawUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/xylem_products_live.json?_t=${Date.now()}`;
    const res = await fetch(rawUrl, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, ...data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response(JSON.stringify({ success: false, message: 'No catalog found' }), {
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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Cashfree Payment Order Endpoints
    if (url.pathname === '/api/create-cashfree-order' || url.pathname === '/api/create-order') {
      return handleCreateCashfreeOrder(request, env);
    }

    // 3. Products Endpoint
    if (url.pathname === '/api/products') {
      return handleProducts(request, env);
    }

    // 4. Static Assets & SPA Fallback
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  },
};
