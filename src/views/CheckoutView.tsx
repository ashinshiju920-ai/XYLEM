import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Search,
  User,
  ShoppingBag,
  Zap,
  Headphones,
  CheckCircle2,
  Check,
  Star,
  Shield,
  Loader2,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BookCover } from '../components/BookCover';
import { Book } from '../types';
import { BOOKS } from '../data/books';
import { XylemLogo } from '../components/XylemLogo';
import { CashfreeLogo } from '../components/CashfreeLogo';
import {
  createCashfreeOrder,
  loadCashfreeSDK,
  CASHFREE_PAYMENT_FORM_URL,
} from '../utils/cashfree';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    subtotal,
    total,
    setCurrentView,
    navigateToCatalog,
    openCart,
    cartCount,
    setIsSearchOpen,
    appliedCoupon,
    shippingInfo,
    showToast,
  } = useShop();

  const [isProcessing, setIsProcessing] = useState(false);

  // Active book & pricing calculations
  const primaryItem = cart.length > 0 ? cart[0] : null;
  const activeBook: Book =
    primaryItem?.book || (BOOKS.find((b) => b.id === 'ielts-full-prep') || BOOKS[0]);
  const activeFormat = primaryItem?.format || 'digital';

  const rawOriginalPrice =
    primaryItem?.originalPrice ||
    (activeFormat === 'digital'
      ? activeBook.prices.digital.originalPrice
      : activeBook.prices.physical.originalPrice) ||
    599;

  const rawCurrentPrice =
    primaryItem?.price ||
    (activeFormat === 'digital'
      ? activeBook.prices.digital.price
      : activeBook.prices.physical.price) ||
    199;

  const totalOriginalPrice = cart.reduce(
    (sum, item) => sum + ((item.originalPrice || item.price) * item.quantity),
    0
  );

  const displayOriginalPrice = totalOriginalPrice > 0 ? totalOriginalPrice : rawOriginalPrice;
  const displaySubtotal = subtotal > 0 ? subtotal : rawCurrentPrice;
  const displayTotal = total > 0 ? total : displaySubtotal;
  const displayDiscount = Math.max(0, displayOriginalPrice - displayTotal) || 400;
  const discountPercent = Math.min(
    90,
    Math.max(10, Math.round((displayDiscount / (displayTotal + displayDiscount)) * 100))
  ) || 67;

  // Server-authoritative checkout sending intent only (Rule 3)
  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    try {
      const cartPayload = (cart.length > 0 ? cart : [
        {
          bookId: activeBook.id,
          format: activeFormat,
          quantity: 1,
          selectedAddonIds: [activeFormat],
        },
      ]).map((item: any) => ({
        bookId: item.bookId || item.book?.id || activeBook.id,
        addonIds: item.selectedAddonIds || [item.format || 'digital'],
        format: item.format || 'digital',
        quantity: item.quantity || 1,
      }));

      const orderData = await createCashfreeOrder({
        cart: cartPayload,
        couponCode: appliedCoupon,
        shippingInfo,
        deliveryOption: activeFormat === 'physical' ? 'physical' : 'digital',
      });

      if (orderData.paymentSessionId) {
        const cashfree = await loadCashfreeSDK(
          orderData.environment || (orderData.isProd ? 'production' : 'sandbox')
        );
        if (cashfree && typeof cashfree.checkout === 'function') {
          await cashfree.checkout({
            paymentSessionId: orderData.paymentSessionId,
            redirectTarget: '_self',
          });
          return;
        }
      }

      // Fallback if SDK cannot be loaded
      window.location.href = CASHFREE_PAYMENT_FORM_URL;
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      showToast(err.message || 'Payment initiation failed. Please try again.', 'warning');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-['DM_Sans',sans-serif] selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION (Matching Image 1 Mobile & Image 2 PC)          */}
      {/* ========================================================================= */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-2"
          >
            <XylemLogo />
          </div>

          {/* Desktop Navigation Links (Visible on PC) */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-slate-700">
            <button
              onClick={() => setCurrentView('home')}
              className="hover:text-emerald-700 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigateToCatalog('IELTS')}
              className="hover:text-emerald-700 transition-colors"
            >
              IELTS
            </button>
            <button
              onClick={() => navigateToCatalog('OET')}
              className="hover:text-emerald-700 transition-colors"
            >
              OET
            </button>
            <button
              onClick={() => navigateToCatalog('PTE')}
              className="hover:text-emerald-700 transition-colors"
            >
              PTE
            </button>
            <button
              onClick={() => navigateToCatalog('German')}
              className="hover:text-emerald-700 transition-colors"
            >
              German
            </button>
            <button
              onClick={() => navigateToCatalog('All')}
              className="hover:text-emerald-700 transition-colors"
            >
              Books
            </button>
            <button
              onClick={() => setCurrentView('about')}
              className="hover:text-emerald-700 transition-colors"
            >
              About
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Search materials"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentView('orders')}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="My Account"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>
            <button
              onClick={openCart}
              className="relative w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-700 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {cartCount > 0 ? cartCount : 1}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO BANNER SECTION (You're Almost There!)                            */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf6f2] via-[#f2faf7] to-[#f8fafc] pt-6 sm:pt-10 pb-8 sm:pb-10 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center md:text-left md:mx-0 space-y-3 sm:space-y-4">
            {/* Secure Checkout Pill */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200/90 text-emerald-800 text-xs font-bold shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Secure Checkout</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              You’re Almost There!
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Complete your payment securely with Cashfree and get instant access to your study materials.
            </p>

            {/* 4 Trust Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 max-w-xl">
              {/* 1. 100% Secure Payments */}
              <div className="flex items-center gap-2.5 sm:flex-col sm:text-center p-2 rounded-xl bg-white/70 sm:bg-transparent border sm:border-0 border-slate-200/60 shadow-xs sm:shadow-none">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 sm:mx-auto mb-0 sm:mb-1.5 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    100% Secure
                  </span>
                  <span className="block text-[10px] sm:text-[11px] text-slate-500">
                    Payments
                  </span>
                </div>
              </div>

              {/* 2. Instant Access */}
              <div className="flex items-center gap-2.5 sm:flex-col sm:text-center p-2 rounded-xl bg-white/70 sm:bg-transparent border sm:border-0 border-slate-200/60 shadow-xs sm:shadow-none">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 sm:mx-auto mb-0 sm:mb-1.5 shadow-xs">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    Instant
                  </span>
                  <span className="block text-[10px] sm:text-[11px] text-slate-500">
                    Access
                  </span>
                </div>
              </div>

              {/* 3. Trusted by 1M+ Learners */}
              <div className="flex items-center gap-2.5 sm:flex-col sm:text-center p-2 rounded-xl bg-white/70 sm:bg-transparent border sm:border-0 border-slate-200/60 shadow-xs sm:shadow-none">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 sm:mx-auto mb-0 sm:mb-1.5 shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    Trusted by
                  </span>
                  <span className="block text-[10px] sm:text-[11px] text-slate-500">
                    1M+ Learners
                  </span>
                </div>
              </div>

              {/* 4. 24/7 Support */}
              <div className="flex items-center gap-2.5 sm:flex-col sm:text-center p-2 rounded-xl bg-white/70 sm:bg-transparent border sm:border-0 border-slate-200/60 shadow-xs sm:shadow-none">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 sm:mx-auto mb-0 sm:mb-1.5 shadow-xs">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-slate-800 leading-tight">
                    24/7
                  </span>
                  <span className="block text-[10px] sm:text-[11px] text-slate-500">
                    Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN CHECKOUT SECTION (Order Summary & Cashfree Payment Cards)        */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* ===================================================================== */}
          {/* LEFT COLUMN: Order Summary Card                                      */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Order Summary
            </h2>

            {/* Product Item Block */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              {/* Cover Thumbnail */}
              <div className="w-20 h-28 shrink-0 rounded-xl overflow-hidden shadow-md border border-slate-100 bg-slate-50 flex items-center justify-center">
                {activeBook.coverImage ? (
                  <img
                    src={activeBook.coverImage}
                    alt={activeBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookCover book={activeBook} size="sm" showShadow={false} />
                )}
              </div>

              {/* Title, Rating & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-['Plus_Jakarta_Sans',sans-serif]">
                      {activeBook.title}
                    </h3>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <span className="font-bold text-slate-700 ml-0.5">
                        {activeBook.rating || 4.8}
                      </span>
                      <span>({activeBook.reviewCount || 124} reviews)</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                      {activeBook.description ||
                        'Complete study guide for IELTS with 500+ practice questions and full-length mock tests.'}
                    </p>
                  </div>

                  {/* Price Column */}
                  <div className="text-right shrink-0">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      ₹{displayTotal}
                    </div>
                    <span className="inline-block bg-[#00a884] text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5">
                      {discountPercent}% OFF
                    </span>
                    <div className="text-xs text-slate-400 line-through mt-0.5">
                      ₹{displayOriginalPrice}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{displaySubtotal}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-medium">Discount Applied</span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200/80 uppercase">
                    SPECIAL OFFER
                  </span>
                </div>
                <span className="font-bold text-emerald-600">- ₹{displayDiscount}</span>
              </div>
            </div>

            {/* Total Amount Highlight Box */}
            <div className="bg-[#eef9f5] border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Total Amount
                </div>
                <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                  You save ₹{displayDiscount}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                ₹{displayTotal}
              </div>
            </div>

            {/* Security Assurance Banner (Visible in Desktop Mockup) */}
            <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900">
                  Your purchase is 100% secure
                </div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  We use industry-standard encryption to protect your data and payments.
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: Cashfree Payments Card                                 */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 text-center flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Cashfree Logo */}
              <div className="flex justify-center pt-2">
                <CashfreeLogo className="h-10" />
              </div>

              {/* RBI Licensed Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/90 text-emerald-800 text-xs font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[3]" />
                <span>RBI Licensed Payment Aggregator</span>
              </div>

              {/* Descriptive Heading */}
              <div className="pt-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  You will be redirected to Cashfree for secure payment
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed mt-2">
                  Click the button below to proceed to Cashfree's secure payment page. You can complete your payment using your preferred method.
                </p>
              </div>

              {/* BIG EMERALD PROCEED TO PAYMENT BUTTON */}
              <div className="pt-2">
                <button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing}
                  id="proceed-to-payment-btn"
                  className="w-full py-4 px-6 rounded-xl bg-[#00704a] hover:bg-[#005a3b] active:scale-[0.99] text-white text-base sm:text-lg font-bold shadow-lg shadow-emerald-900/15 transition-all cursor-pointer flex items-center justify-center gap-2.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Redirecting to Cashfree...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 text-white/90" />
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              {/* 3 Security Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center">
                <div className="flex flex-col items-center">
                  <Lock className="w-4 h-4 text-emerald-700 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">256-bit</span>
                  <span className="text-[10px] text-slate-500">SSL Encryption</span>
                </div>
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">PCI DSS</span>
                  <span className="text-[10px] text-slate-500">Compliant</span>
                </div>
                <div className="flex flex-col items-center">
                  <Shield className="w-4 h-4 text-emerald-700 mb-1" />
                  <span className="text-[11px] font-bold text-slate-800">Fraud Protection</span>
                  <span className="text-[10px] text-slate-500">Powered by AI</span>
                </div>
              </div>
            </div>

            {/* Powered by Cashfree Footer Pill */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-center gap-2 text-xs text-slate-600 mt-4">
              <span className="font-bold text-slate-800">Powered by Cashfree Payments</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">India's most trusted payment gateway</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. SHOP WITH CONFIDENCE TRUST BAR                                        */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left Header */}
            <div className="flex items-center gap-3.5 text-left w-full lg:w-auto">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Shop with Confidence
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your data and payments are always protected with industry-leading security standards.
                </p>
              </div>
            </div>

            {/* Right 4 Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 w-full lg:w-auto text-center">
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 mb-1" />
                <span className="text-xs font-bold text-slate-800">RBI</span>
                <span className="text-[10px] text-slate-500">Licensed</span>
              </div>
              <div className="flex flex-col items-center">
                <Lock className="w-4 h-4 text-emerald-700 mb-1" />
                <span className="text-xs font-bold text-slate-800">PCI DSS</span>
                <span className="text-[10px] text-slate-500">Compliant</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-emerald-700 mb-1" />
                <span className="text-xs font-bold text-slate-800">256-bit</span>
                <span className="text-[10px] text-slate-500">SSL Encryption</span>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-4 h-4 text-emerald-700 mb-1" />
                <span className="text-xs font-bold text-slate-800">Fraud Detection</span>
                <span className="text-[10px] text-slate-500">Powered by AI</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 5. BOTTOM FOOTER WITH LANDSCAPE & CALLIGRAPHY                           */}
      {/* ========================================================================= */}
      <footer className="relative bg-[#043326] text-white pt-12 pb-14 overflow-hidden mt-auto">
        {/* Subtle landscape hill graphic / gradient */}
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#022018] via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
          {/* Left Handwritten Script */}
          <div className="font-['Caveat',cursive] text-3xl sm:text-4xl lg:text-[38px] text-emerald-200/95 leading-tight select-none transform -rotate-2">
            <div>Learn Today.</div>
            <div className="text-white">Build Your Tomorrow.</div>
          </div>

          {/* Right Brand & Categories */}
          <div className="flex flex-col items-center sm:items-end space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight font-['Plus_Jakarta_Sans',sans-serif] text-white">
                XYLEM
              </span>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
                LEARNING
              </span>
            </div>
            <div className="text-[10px] tracking-widest uppercase text-emerald-300/80 font-bold">
              LEARN • PRACTICE • ACHIEVE
            </div>

            {/* Category links */}
            <div className="flex items-center gap-3 text-xs text-emerald-100/70 pt-2 font-medium">
              <button
                onClick={() => navigateToCatalog('IELTS')}
                className="hover:text-white transition-colors"
              >
                IELTS
              </button>
              <span>|</span>
              <button
                onClick={() => navigateToCatalog('OET')}
                className="hover:text-white transition-colors"
              >
                OET
              </button>
              <span>|</span>
              <button
                onClick={() => navigateToCatalog('PTE')}
                className="hover:text-white transition-colors"
              >
                PTE
              </button>
              <span>|</span>
              <button
                onClick={() => navigateToCatalog('German')}
                className="hover:text-white transition-colors"
              >
                GERMAN
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
