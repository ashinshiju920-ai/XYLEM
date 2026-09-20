declare global {
  interface Window {
    Cashfree?: (config: { mode: 'sandbox' | 'production' }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: '_modal' | '_self' | '_blank';
      }) => Promise<{
        error?: { message: string; code?: string };
        redirect?: boolean;
        paymentDetails?: any;
      }>;
    };
  }
}

export const GOOGLE_SHEET_COPY_URL =
  'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/copy';

/**
 * Ensures Cashfree v3 JS SDK is injected into the DOM and initialized with correct mode (production vs sandbox).
 */
export async function loadCashfreeSDK(mode: 'sandbox' | 'production' = 'production'): Promise<any> {
  if (typeof window === 'undefined') return null;

  if (window.Cashfree) {
    return window.Cashfree({ mode });
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="cashfree.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Cashfree) {
          resolve(window.Cashfree({ mode }));
        } else {
          reject(new Error('Cashfree SDK failed to initialize'));
        }
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree({ mode }));
      } else {
        reject(new Error('Cashfree SDK object not found on window'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK script'));
    document.head.appendChild(script);
  });
}

/**
 * Creates a Cashfree payment order via Cloudflare Pages endpoint
 */
export async function createCashfreeOrder(params: {
  cart?: any[];
  couponCode?: string | null;
  shippingInfo?: any;
  requestedAmount?: number;
  productId?: string;
  productTitle?: string;
  price?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}): Promise<{
  success: boolean;
  payment_session_id: string;
  paymentSessionId?: string;
  order_id: string;
  orderId?: string;
  order_amount: number;
  orderAmount?: number;
  environment?: 'sandbox' | 'production';
  isProd?: boolean;
}> {
  let res = await fetch('/api/create-cashfree-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  // Fallback to /api/create-order if /api/create-cashfree-order returned 404
  if (res.status === 404) {
    res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  }

  const data = await res.json();
  const sessionId = data.payment_session_id || data.paymentSessionId;

  if (res.ok && sessionId) {
    return {
      ...data,
      payment_session_id: sessionId,
      paymentSessionId: sessionId,
      environment: data.environment || (data.isProd ? 'production' : 'sandbox'),
    };
  }

  const errorMessage = data.error || data.message || (data.details && data.details.message) || 'Failed to initialize Cashfree order session';
  throw new Error(errorMessage);
}
