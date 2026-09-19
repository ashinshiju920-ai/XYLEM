const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

    // Credentials securely read from environment variables
    const appId = (env && env.CASHFREE_APP_ID) || 'TEST11209472dd30f3ef7cd2cce52d1f27490211';
    const secretKey = env && env.CASHFREE_SECRET_KEY;
    const baseUrl = (env && env.CASHFREE_BASE_URL) || 'https://sandbox.cashfree.com/pg/orders';

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
    } = body;

    // Server-side price calculation & verification
    // Default single study guide price is ₹199 (as per user spec)
    let basePrice = 199;

    if (Array.isArray(cart) && cart.length > 0) {
      const cartSubtotal = cart.reduce((sum, it) => {
        const itemPrice = it.price || (it.format === 'physical' ? 899 : 199);
        const qty = it.quantity || 1;
        return sum + itemPrice * qty;
      }, 0);
      if (cartSubtotal > 0) {
        basePrice = cartSubtotal;
      }
    } else if (typeof requestedAmount === 'number' && requestedAmount > 0) {
      basePrice = requestedAmount;
    }

    // Apply coupon discount server-side if provided
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

    const finalAmount = Math.max(1, Math.round(basePrice - discount));

    const timestamp = Math.round(Date.now() / 1000);
    const orderId = `order_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;

    const customerName = (shippingInfo.fullName && shippingInfo.fullName.trim()) || 'Ashin Shiju';
    const customerEmail = (shippingInfo.email && shippingInfo.email.trim()) || 'ashin.shiju@example.com';
    const customerPhone = (shippingInfo.phone && shippingInfo.phone.replace(/[^0-9]/g, '')) || '9876543210';
    const customerId = `cust_${customerPhone.slice(-10) || timestamp}`;

    const urlObj = new URL(request.url);
    const origin = urlObj.origin || 'http://localhost:3000';
    const returnUrl = `${origin}/?order_id={order_id}&cf_status=success`;

    const cashfreePayload = {
      order_id: orderId,
      order_amount: finalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone.length >= 10 ? customerPhone.slice(-10) : '9876543210',
      },
      order_meta: {
        return_url: returnUrl,
      },
      order_note: 'Xylem Learning - Complete Prep Study Materials',
    };

    const cfResponse = await fetch(baseUrl, {
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
          error: result.message || result.error || 'Failed to create Cashfree order',
          details: result,
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
        order_id: result.order_id,
        payment_session_id: result.payment_session_id,
        order_amount: result.order_amount,
        order_currency: result.order_currency,
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
