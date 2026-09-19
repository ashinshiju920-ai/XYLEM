import React from 'react';
import { ShoppingBag, Zap, Search, BookOpen, ShieldCheck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const MobileBottomBar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    cartCount,
    openCart,
    setIsSearchOpen,
    books,
    buyNow,
  } = useShop();

  // Hide on checkout, admin, and order success
  if (currentView === 'checkout' || currentView === 'admin' || currentView === 'order-success') {
    return null;
  }

  const defaultBook = books[0] || {
    id: 'ielts-full-prep',
    title: 'IELTS Full Prep',
    prices: { digital: { price: 199 } },
  };

  return (
    <aside aria-label="Mobile quick actions" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2.5 shadow-[0_-8px_25px_rgba(0,0,0,0.06)] animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        {/* Search button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center text-slate-600 hover:text-emerald-700 py-1 px-2 transition-colors"
          aria-label="Search study materials"
        >
          <Search className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium mt-0.5">Search</span>
        </button>

        {/* Catalog */}
        <button
          onClick={() => setCurrentView('catalog')}
          className="flex flex-col items-center justify-center text-slate-600 hover:text-emerald-700 py-1 px-2 transition-colors"
          aria-label="View all books"
        >
          <BookOpen className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] font-medium mt-0.5">Books</span>
        </button>

        {/* Cart with count badge */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center text-slate-600 hover:text-emerald-700 py-1 px-2 relative transition-colors"
          aria-label="View shopping cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-emerald-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-0.5">Cart</span>
        </button>

        {/* Instant 1-Click Buy Now CTA */}
        <button
          onClick={() => buyNow(defaultBook as any, 'digital')}
          className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#00875a] to-[#00734c] text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <Zap className="w-3.5 h-3.5 fill-white" />
          <span>Buy Now • ₹199</span>
        </button>
      </div>
    </aside>
  );
};
