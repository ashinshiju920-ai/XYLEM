/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ContactModal } from './components/ContactModal';

// Views
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { ProductDetailView } from './views/ProductDetailView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { OrderSuccessView } from './views/OrderSuccessView';
import { OrdersHistoryView } from './views/OrdersHistoryView';
import { AboutView } from './views/AboutView';
import { AdminView } from './views/AdminView';

const ShopApp: React.FC = () => {
  const { currentView, setCurrentView } = useShop();

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
        {currentView === 'home' && <HomeView />}
        {currentView === 'catalog' && <CatalogView />}
        {currentView === 'product' && <ProductDetailView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'order-success' && <OrderSuccessView />}
        {currentView === 'orders' && <OrdersHistoryView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'admin' && <AdminView />}
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
