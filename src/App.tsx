/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ContactModal } from './components/ContactModal';

// Views
const HomeView = lazy(() => import('./views/HomeView').then((module) => ({ default: module.HomeView })));
const CatalogView = lazy(() => import('./views/CatalogView').then((module) => ({ default: module.CatalogView })));
const ProductDetailView = lazy(() => import('./views/ProductDetailView').then((module) => ({ default: module.ProductDetailView })));
const CartView = lazy(() => import('./views/CartView').then((module) => ({ default: module.CartView })));
const CheckoutView = lazy(() => import('./views/CheckoutView').then((module) => ({ default: module.CheckoutView })));
const OrderSuccessView = lazy(() => import('./views/OrderSuccessView').then((module) => ({ default: module.OrderSuccessView })));
const OrdersHistoryView = lazy(() => import('./views/OrdersHistoryView').then((module) => ({ default: module.OrdersHistoryView })));
const AboutView = lazy(() => import('./views/AboutView').then((module) => ({ default: module.AboutView })));
const AdminView = lazy(() => import('./views/AdminView').then((module) => ({ default: module.AdminView })));
import { checkOrderStatus } from './utils/cashfree';
import { Order } from './types';
import { BOOKS } from './data/books';

const ShopApp: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    books,
    shippingInfo,
    clearCart,
    setCurrentOrder,
    showToast,
  } = useShop();

  // Handle Cashfree return: verify payment server-side before unlocking order
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id') || params.get('orderId');
    const accessToken = params.get('access_token') || sessionStorage.getItem(`xylem_order_access:${orderId}`);
    const cfStatus = params.get('cf_status') || params.get('status');

    if (orderId) {
      if (params.get('access_token')) {
        sessionStorage.setItem(`xylem_order_access:${orderId}`, params.get('access_token')!);
      }
      checkOrderStatus(orderId, accessToken)
        .then((res) => {
          if (res && res.status === 'PAID') {
            clearCart();
            const verifiedOrder: Order = {
              id: res.orderId || orderId,
              date: res.date
                ? new Date(res.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
              items: (res.items || []).map((it: any) => {
                const bookId = it.bookId || it.id;
                const bookObj =
                  books.find((b) => b.id === bookId) ||
                  BOOKS.find((b) => b.id === bookId) ||
                  BOOKS[0];
                return {
                  bookId,
                  book: bookObj,
                  format: (it.format === 'physical' ? 'physical' : 'digital') as 'digital' | 'physical',
                  quantity: it.quantity || 1,
                  price: it.unitPrice || (it.format === 'physical' ? 999 : 199),
                };
              }),
              shipping: {
                ...shippingInfo,
                fullName: res.customerName || shippingInfo.fullName,
                email: res.customerEmail || shippingInfo.email,
              },
              subtotal: res.total || 199,
              discount: 0,
              deliveryFee: 0,
              total: res.total || 199,
              paymentMethod: 'upi',
              status: 'PAID',
              fulfillment: res.fulfillment,
            };
            setCurrentOrder(verifiedOrder);
            setCurrentView('order-success');
            showToast('Payment confirmed! Your study materials are unlocked.', 'success');
          } else {
            showToast('Payment verification pending or order unpaid.', 'warning');
          }
        })
        .catch(() => {
          showToast('Could not verify payment status with server.', 'warning');
        })
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname);
        });
    } else if (cfStatus) {
      // Visiting /?cf_status=success without real payment unlocks nothing!
      showToast('No verified order found. Payment verification required.', 'warning');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [books]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  const isStorefront = currentView !== 'checkout' && currentView !== 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-slate-900 font-['DM_Sans',sans-serif] selection:bg-emerald-100 selection:text-emerald-900 relative">
      {/* Top Header Navigation */}
      {isStorefront && <Header />}

      {/* Main View Router */}
      <main className="flex-1">
        <Suspense fallback={<div className="min-h-[40vh] grid place-items-center text-sm text-slate-500">Loading…</div>}>
        {currentView === 'home' && <HomeView />}
        {currentView === 'catalog' && <CatalogView />}
        {currentView === 'product' && <ProductDetailView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'order-success' && <OrderSuccessView />}
        {currentView === 'orders' && <OrdersHistoryView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'admin' && <AdminView />}
        </Suspense>
      </main>

      {/* Footer */}
      {isStorefront && <Footer />}

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <SearchModal />
      <PdfViewerModal />
      <ContactModal />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <ShopApp />
    </ShopProvider>
  );
}
