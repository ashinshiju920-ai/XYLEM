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
 * Ensures Cashfree v3 JS SDK is injected into the DOM.
 */
export async function loadCashfreeSDK(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if (window.Cashfree) {
    return window.Cashfree({ mode: 'sandbox' });
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="cashfree.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        if (window.Cashfree) {
          resolve(window.Cashfree({ mode: 'sandbox' }));
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
        resolve(window.Cashfree({ mode: 'sandbox' }));
      } else {
        reject(new Error('Cashfree SDK object not found on window'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK script'));
    document.head.appendChild(script);
  });
}

/**
 * Creates a Cashfree payment order via Cloudflare Pages /api/create-cashfree-order
 */
export async function createCashfreeOrder(params: {
  cart?: any[];
  couponCode?: string | null;
  shippingInfo?: any;
  requestedAmount?: number;
}): Promise<{
  success: boolean;
  payment_session_id: string;
  order_id: string;
  order_amount: number;
}> {
  const res = await fetch('/api/create-cashfree-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await res.json();
  if (res.ok && data.success && data.payment_session_id) {
    return data;
  }

  throw new Error(data.error || data.message || 'Failed to initialize Cashfree order session');
}

