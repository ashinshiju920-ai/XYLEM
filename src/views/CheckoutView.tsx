import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle2,
  Tag,
  Loader2,
  Download,
  Star,
  BookOpen,
  Headphones,
  CheckSquare,
  Award,
  Zap,
  Clock,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BookCover } from '../components/BookCover';
import { PaymentMethod, Book } from '../types';
import { BOOKS } from '../data/books';
import { XylemLogo } from '../components/XylemLogo';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    subtotal,
    deliveryFee,
    total,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingInfo,
    setShippingInfo,
    placeOrder,
    setCurrentView,
    setIsContactModalOpen,
    showToast,
  } = useShop();

  // Active book for preview (default to IELTS full prep matching the mockup)
  const activeBook: Book = cart.length > 0 ? cart[0].book : (BOOKS.find((b) => b.id === 'ielts-full-prep') || BOOKS[0]);
  const activeFormat = cart.length > 0 ? cart[0].format : 'digital';
  const originalPrice = activeFormat === 'digital' ? activeBook.prices.digital.originalPrice : activeBook.prices.physical.originalPrice;
  const currentPrice = activeFormat === 'digital' ? activeBook.prices.digital.price : activeBook.prices.physical.price;
  const savingsAmount = originalPrice - currentPrice;

  // Checkout step: 1 = Shipping, 2 = Payment (default from mockup), 3 = Review
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(2);

  // Payment method selection
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiTab, setUpiTab] = useState<'apps' | 'id' | 'qr'>('apps');
  const [upiId, setUpiId] = useState('ashin@okaxis');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');

  // Card fields
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8829');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('829');
  const [cardName, setCardName] = useState('Ashin Shiju');

  // Net banking & wallets
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('PhonePe');

  // Coupon input
  const [couponInput, setCouponInput] = useState('');

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  // Live animated countdown timer: 23 hours, 59 mins, 32 secs (as in image)
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 32,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 45 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput);
      setCouponInput('');
    }
  };

  const handlePayNow = async () => {
    setIsProcessing(true);
    setProcessingStatus('Initiating 256-bit encrypted transaction...');

    setTimeout(() => {
      setProcessingStatus(`Authorizing payment with ${paymentMethod.toUpperCase()} gateway...`);
    }, 800);

    setTimeout(() => {
      setProcessingStatus('Verifying cryptographic response & generating PDF license...');
    }, 1600);

    setTimeout(async () => {
      setIsProcessing(false);
      await placeOrder(paymentMethod);
      showToast('Payment successful! Your order has been placed.', 'success');
    }, 2400);
  };

  return (
    <div className="relative min-h-screen bg-[#f8fafc] text-slate-900 font-['DM_Sans',sans-serif] overflow-x-hidden pb-28 sm:pb-16">
      {/* Decorative Botanical Leaf Accents */}
      <div className="absolute top-0 right-0 pointer-events-none z-10 w-44 sm:w-64 opacity-80 select-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M190 10 C150 40, 140 80, 160 130 C170 90, 190 60, 190 10 Z" fill="#00875a" fillOpacity="0.8" />
          <path d="M185 30 C130 55, 110 95, 125 150 C140 105, 165 70, 185 30 Z" fill="#00a36c" fillOpacity="0.6" />
          <path d="M150 20 C110 50, 95 90, 105 130 C120 90, 140 60, 150 20 Z" fill="#34d399" fillOpacity="0.4" />
          <path d="M195 2 C160 35, 145 90, 165 140" stroke="#00734c" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="absolute bottom-12 right-0 pointer-events-none z-10 w-40 sm:w-56 opacity-85 select-none">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M190 190 C150 160, 140 120, 160 70 C170 110, 190 140, 190 190 Z" fill="#00875a" fillOpacity="0.8" />
          <path d="M185 170 C130 145, 110 105, 125 50 C140 95, 165 130, 185 170 Z" fill="#00a36c" fillOpacity="0.6" />
          <path d="M150 180 C110 150, 95 110, 105 70 C120 110, 140 140, 150 180 Z" fill="#34d399" fillOpacity="0.4" />
          <path d="M195 198 C160 165, 145 110, 165 60" stroke="#00734c" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Top Focused Checkout Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('home')}
            className="cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <XylemLogo size="sm" showTagline={true} />
          </div>

          {/* Center Trust Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Secure Checkout</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-normal">100% Safe & Encrypted</span>
          </div>

          {/* Right Help Desk */}
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="flex items-center gap-2.5 text-left text-xs hover:text-emerald-700 transition-colors group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <div className="font-semibold text-slate-900 leading-tight">Need Help?</div>
              <div className="text-[11px] text-slate-500">Our team is here 24/7</div>
            </div>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* 1. TOP TRUST BANNER CARD (Exact Match from Mockup) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-white border border-emerald-200/90 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Headline & Student Count */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-[#00734c] text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                  Thousands of students trust Xylem Learning
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Join 1M+ learners who achieved their dreams with our study materials
                </p>
              </div>
            </div>

            {/* Right 4 Value Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-emerald-100">
              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                  100% Secure Payments
                </span>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                  Instant Download (PDF)
                </span>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                  Trusted by Learners Worldwide
                </span>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Headphones className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-semibold text-slate-800 leading-tight">
                  Hassle-Free Support
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. PROGRESS STEPPER (Shipping -> Payment -> Review) */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-6 py-2 px-1 text-xs w-full">
          {/* Step 1: Shipping */}
          <button
            onClick={() => setActiveStep(1)}
            className="flex items-center gap-2 text-left cursor-pointer group transition-opacity shrink-0"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              ✓
            </div>
            <div>
              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-[11px] sm:text-xs">
                Shipping
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium hidden xs:block">Your details</div>
            </div>
          </button>

          <div className="flex-1 sm:w-16 max-w-16 h-[2px] bg-emerald-400/80 rounded-full" />

          {/* Step 2: Payment (Active) */}
          <button
            onClick={() => setActiveStep(2)}
            className="flex items-center gap-2 text-left cursor-pointer shrink-0"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#00875a] text-white flex items-center justify-center font-bold text-xs ring-4 ring-emerald-100 shadow-xs">
              2
            </div>
            <div>
              <div className="font-bold text-emerald-800 text-[11px] sm:text-xs">Payment</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 font-medium hidden xs:block">Choose method</div>
            </div>
          </button>

          <div className="flex-1 sm:w-16 max-w-16 h-[2px] bg-slate-200 rounded-full" />

          {/* Step 3: Review */}
          <button
            onClick={() => setActiveStep(3)}
            className="flex items-center gap-2 text-left cursor-pointer opacity-70 hover:opacity-100 shrink-0"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <div className="font-semibold text-slate-700 text-[11px] sm:text-xs">Review</div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 hidden xs:block">Confirm order</div>
            </div>
          </button>
        </div>

        {/* STEP 1 MODAL / ACCORDION: If user clicks Shipping, allow editing */}
        {activeStep === 1 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Shipping & Learner Details
              </h3>
              <span className="text-xs text-emerald-700 font-semibold">Step 1 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email (For Instant PDF License)</label>
                <input
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">State / Region</label>
                <input
                  type="text"
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  showToast('Shipping details saved!', 'success');
                  setActiveStep(2);
                }}
                className="px-6 py-2.5 bg-[#00875a] hover:bg-[#00734c] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 3. MAIN SPLIT LAYOUT (LEFT 65% | RIGHT 35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ======================= LEFT COLUMN ======================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* PAYMENT METHOD CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Payment Method
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose your preferred payment method. Your information is 100% secure.
                  </p>
                </div>
              </div>

              {/* 4 Security Assurance Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-sky-600" />
                  <span>Razorpay Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-emerald-600" />
                  <span>UPI & Cards</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>No Hidden Charges</span>
                </div>
              </div>

              {/* Payment Option Radios */}
              <div className="space-y-3">
                {/* 1. UPI Option */}
                <div
                  onClick={() => setPaymentMethod('upi')}
                  className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  {/* "Most Popular" Pill */}
                  <span className="absolute -top-2.5 left-8 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                    Most Popular
                  </span>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Radio Circle */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          paymentMethod === 'upi'
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {paymentMethod === 'upi' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                            UPI (Google Pay, PhonePe, Paytm, etc.)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Pay securely with any UPI app
                        </p>
                      </div>
                    </div>

                    {/* App Logos on Right */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* GPay */}
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700 border border-slate-200">
                        G Pay
                      </span>
                      {/* PhonePe */}
                      <div className="w-6 h-6 rounded-full bg-[#5f259f] text-white flex items-center justify-center text-[10px] font-bold">
                        पे
                      </div>
                      {/* Paytm */}
                      <span className="px-1.5 py-0.5 rounded bg-sky-50 text-[10px] font-bold text-sky-700 border border-sky-200">
                        Paytm
                      </span>
                      {/* BHIM / UPI icon */}
                      <div className="w-6 h-6 rounded bg-emerald-700 text-white flex items-center justify-center text-[8px] font-black">
                        UPI
                      </div>
                    </div>
                  </div>

                  {/* Expanded Interactive UPI Sub-panel */}
                  {paymentMethod === 'upi' && (
                    <div className="mt-3.5 pt-3.5 border-t border-emerald-100/80 space-y-3 animate-in fade-in duration-150">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpiTab('apps');
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                            upiTab === 'apps'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Quick UPI Apps
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpiTab('id');
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                            upiTab === 'id'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Enter UPI ID
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpiTab('qr');
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
                            upiTab === 'qr'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Scan QR Code
                        </button>
                      </div>

                      {upiTab === 'apps' && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                          {[
                            { id: 'gpay', name: 'Google Pay', badge: 'GPay' },
                            { id: 'phonepe', name: 'PhonePe', badge: 'पे' },
                            { id: 'paytm', name: 'Paytm UPI', badge: 'Paytm' },
                            { id: 'bhim', name: 'BHIM UPI', badge: 'BHIM' },
                          ].map((app) => (
                            <button
                              key={app.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUpiApp(app.id as any);
                                showToast(`Selected ${app.name} for instant payment`);
                              }}
                              className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                                selectedUpiApp === app.id
                                  ? 'border-emerald-600 bg-white ring-2 ring-emerald-100 shadow-xs'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <span className="text-xs font-bold text-slate-800">{app.name}</span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Fast
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {upiTab === 'id' && (
                        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => showToast(`UPI ID ${upiId} verified!`, 'success')}
                            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
                          >
                            Verify
                          </button>
                        </div>
                      )}

                      {upiTab === 'qr' && (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-center gap-4 text-center">
                          <div className="w-20 h-20 bg-slate-950 p-1.5 rounded-lg flex items-center justify-center">
                            {/* Visual QR Code Pattern */}
                            <div className="w-full h-full bg-white grid grid-cols-4 p-1 gap-0.5">
                              <div className="bg-black" />
                              <div className="bg-black" />
                              <div className="bg-white" />
                              <div className="bg-black" />
                              <div className="bg-white" />
                              <div className="bg-black" />
                              <div className="bg-black" />
                              <div className="bg-white" />
                              <div className="bg-black" />
                              <div className="bg-white" />
                              <div className="bg-black" />
                              <div className="bg-black" />
                            </div>
                          </div>
                          <div className="text-left text-xs">
                            <div className="font-bold text-slate-900">Scan & Pay ₹{total}</div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Use PhonePe, Google Pay, Paytm, or BHIM to scan
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Credit / Debit Card Option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'card'
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {paymentMethod === 'card' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                          Credit / Debit Card
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Visa, Mastercard, RuPay
                        </p>
                      </div>
                    </div>

                    {/* Logos */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-black text-blue-900 tracking-wider text-xs italic px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                        VISA
                      </span>
                      {/* Mastercard 2 circles */}
                      <div className="flex items-center -space-x-1.5 bg-slate-100 px-1.5 py-1 rounded border border-slate-200">
                        <div className="w-3.5 h-3.5 rounded-full bg-red-600" />
                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500 opacity-90" />
                      </div>
                      <span className="font-bold text-emerald-800 text-[10px] px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                        RuPay
                      </span>
                    </div>
                  </div>

                  {/* Card Form Expanded */}
                  {paymentMethod === 'card' && (
                    <div className="mt-3.5 pt-3.5 border-t border-emerald-100/80 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Net Banking */}
                <div
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'netbanking'
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          paymentMethod === 'netbanking'
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {paymentMethod === 'netbanking' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                          Net Banking
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          All major banks
                        </p>
                      </div>
                    </div>

                    {/* Bank Icons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                        SBI
                      </div>
                      <div className="w-5 h-5 rounded-full bg-blue-900 text-white text-[8px] font-bold flex items-center justify-center">
                        HDFC
                      </div>
                      <div className="w-5 h-5 rounded-full bg-orange-600 text-white text-[9px] font-bold flex items-center justify-center">
                        i
                      </div>
                      <div className="w-5 h-5 rounded-full bg-rose-900 text-white text-[9px] font-bold flex items-center justify-center">
                        AX
                      </div>
                    </div>
                  </div>

                  {paymentMethod === 'netbanking' && (
                    <div className="mt-3.5 pt-3.5 border-t border-emerald-100/80 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            onClick={() => setSelectedBank(bank)}
                            className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                              selectedBank === bank
                                ? 'border-emerald-600 bg-white text-emerald-800 ring-2 ring-emerald-100'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Wallets */}
                <div
                  onClick={() => setPaymentMethod('wallets')}
                  className={`rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                    paymentMethod === 'wallets'
                      ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          paymentMethod === 'wallets'
                            ? 'border-emerald-600 bg-emerald-600'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {paymentMethod === 'wallets' && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                          Wallets
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Paytm, PhonePe, Amazon Pay, etc.
                        </p>
                      </div>
                    </div>

                    {/* Wallet Icons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-sky-50 text-[10px] font-bold text-sky-700 border border-sky-200">
                        Paytm
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[10px] font-bold text-purple-700 border border-purple-200">
                        PhonePe
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-[10px] font-bold text-amber-800 border border-amber-200">
                        amazon pay
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LIMITED TIME OFFER TIMER CARD (Exact Match from Mockup) */}
            <div className="relative rounded-2xl bg-[#f0fdf4] border border-emerald-300/80 p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                {/* Left side text & animated stopwatch */}
                <div className="flex items-start gap-4">
                  <div className="relative w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 animate-pulse" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white animate-ping" />
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                      Limited Time Offer
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Complete Your Order Now & Save Big!
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm leading-relaxed">
                      This special price won't last forever. Secure your study guide today and start your journey towards a better future!
                    </p>
                  </div>
                </div>

                {/* Right side countdown boxes */}
                <div className="text-center shrink-0 self-center sm:self-auto">
                  <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                    Offer Ends In
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-900 font-mono">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 font-sans">Hours</span>
                    </div>
                    <span className="font-bold text-emerald-700 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        {String(timeLeft.minutes).padStart(2, '0')}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 font-sans">Minutes</span>
                    </div>
                    <span className="font-bold text-emerald-700 -mt-3">:</span>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-base font-bold shadow-xs">
                        {String(timeLeft.seconds).padStart(2, '0')}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 font-sans">Seconds</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BIG VIBRANT GLOWING CTA BUTTON WITH ANIMATIONS */}
            <div className="relative pt-2 text-center">
              {/* Decorative hand-drawn radiating dash marks around button */}
              <div className="absolute -top-1 left-1/4 transform -translate-x-12 hidden sm:block">
                <svg width="34" height="24" viewBox="0 0 34 24" fill="none" className="text-emerald-500 animate-float-gentle">
                  <path d="M4 18L10 12M16 6L16 2M26 12L32 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <div className="absolute -top-1 right-1/4 transform translate-x-12 hidden sm:block">
                <svg width="34" height="24" viewBox="0 0 34 24" fill="none" className="text-emerald-500 animate-float-gentle">
                  <path d="M30 18L24 12M18 6L18 2M8 12L2 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              <button
                id="proceed-to-pay-main-btn"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="w-full relative overflow-hidden rounded-full py-4 px-8 bg-gradient-to-r from-[#00875a] via-[#009b67] to-[#00744e] text-white text-base sm:text-lg font-bold font-['Plus_Jakarta_Sans',sans-serif] tracking-wide shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/45 active:scale-[0.99] transition-all cursor-pointer animate-pulse-glow flex items-center justify-center gap-2.5"
              >
                {/* Shimmer sweep effect across button */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer pointer-events-none" />

                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Proceed to Pay ₹{total}</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 mt-2.5 flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Your payment is 100% secure and encrypted</span>
              </p>
            </div>

            {/* WHY STUDENTS CHOOSE XYLEM LEARNING? */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
                <span className="text-emerald-600">🌱</span>
                <span>Why Students Choose Xylem Learning?</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center text-center shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Expert Curated Content
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">By subject experts</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center text-center shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    500+ Practice Questions
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">With detailed solutions</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center text-center shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Flexible Learning
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Study anytime, anywhere</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center text-center shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    Proven Results
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Trusted by 1M+ learners</p>
                </div>
              </div>

              {/* STUDENT TESTIMONIAL CARD (Dark Navy Card with Calligraphy) */}
              <div className="relative overflow-hidden rounded-2xl bg-[#071d36] text-white p-5 sm:p-6 shadow-md border border-slate-800">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                  <div className="flex items-center sm:items-start gap-4">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                      alt="Anjali S"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      {/* 5 Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-200 italic leading-relaxed max-w-sm">
                        "Xylem Learning was a game changer for my IELTS preparation. The mock tests and detailed explanations really helped me score higher!"
                      </p>
                      <div className="text-[11px] text-emerald-400 font-semibold pt-0.5">
                        – Anjali S, IELTS Aspirant
                      </div>
                    </div>
                  </div>

                  {/* Calligraphy handwritten script */}
                  <div className="text-right sm:self-center font-script text-2xl sm:text-3xl text-emerald-300 select-none transform rotate-[-4deg] shrink-0">
                    <div>Real People.</div>
                    <div>Real Success.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================= RIGHT COLUMN (Sidebar) ======================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* BOOK PREVIEW CARD (Exact Match from Mockup) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-[11px] font-bold">
                  Save ₹{savingsAmount > 0 ? savingsAmount : 400}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>Limited Time Offer</span>
                </span>
              </div>

              {/* Book Content Split: Cover Left | Info Right */}
              <div className="grid grid-cols-12 gap-3.5 items-center">
                {/* 3D Cover */}
                <div className="col-span-4 flex justify-center">
                  <BookCover book={activeBook} size="sm" showShadow={true} />
                </div>

                {/* Info */}
                <div className="col-span-8 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] leading-tight line-clamp-2">
                    {activeBook.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="flex text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </div>
                    <span className="font-bold text-slate-800">{activeBook.rating}</span>
                    <span className="text-slate-400">({activeBook.reviewCount} reviews)</span>
                  </div>

                  <ul className="space-y-1 text-[11px] text-slate-600 pt-1">
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Complete syllabus coverage</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>500+ practice questions</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Full-length mock tests</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Exam strategies & tips</span>
                    </li>
                  </ul>

                  {/* Pricing row */}
                  <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-xs text-slate-400 line-through">
                      ₹{originalPrice}
                    </span>
                    <span className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      ₹{currentPrice}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {activeFormat === 'digital' ? activeBook.prices.digital.discountPercent : activeBook.prices.physical.discountPercent}% OFF
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlight bar: You Save ₹400! */}
              <div className="bg-[#ecfdf5] border border-emerald-200/80 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>You Save ₹{savingsAmount > 0 ? savingsAmount : 400}!</span>
              </div>
            </div>

            {/* ORDER SUMMARY CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckSquare className="w-3 h-3" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif]">
                    Order Summary
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">{cart.length || 1} Item</span>
              </div>

              {/* Line item */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-9 bg-slate-900 rounded shrink-0 flex items-center justify-center text-white text-[8px] font-bold">
                    PDF
                  </div>
                  <span className="text-slate-800 font-medium truncate">
                    {activeBook.title}
                  </span>
                </div>
                <span className="font-bold text-slate-900 shrink-0">₹{currentPrice}</span>
              </div>

              {/* Coupon Code Section */}
              <div className="pt-2 border-t border-slate-100">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appliedCoupon}</span>
                      <span className="font-normal text-emerald-700">(-₹{discount})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon: XYLEM20 / FIRST50"
                      className="flex-1 text-[11px] px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#00875a] hover:bg-[#00734c] text-white text-[11px] font-semibold rounded-lg"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal > 0 ? subtotal : currentPrice}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <span>Discount</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      {appliedCoupon ? appliedCoupon : 'SPECIAL OFFER'}
                    </span>
                  </span>
                  <span>-₹{discount > 0 ? discount : savingsAmount}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold text-emerald-700">
                    {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE'}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-emerald-700 font-['Plus_Jakarta_Sans',sans-serif]">
                    ₹{total > 0 ? total : currentPrice}
                  </span>
                </div>
              </div>
            </div>

            {/* TRUST & REASSURANCE BOXES (Mockup Right Side) */}
            <div className="space-y-3">
              {/* Box 1: 100% Secure Checkout */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      100% Secure Checkout
                    </h5>
                    <p className="text-[11px] text-slate-500">Your information is safe with us.</p>
                  </div>
                </div>

                {/* Logos */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 px-2 text-slate-600">
                  <span className="text-[10px] font-black text-emerald-800">UPI</span>
                  <span className="text-[11px] font-black text-blue-900 italic">VISA</span>
                  <div className="flex items-center -space-x-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-600" />
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 opacity-90" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800">RuPay</span>
                </div>
              </div>

              {/* Box 2: Instant Access After Payment */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Instant Access After Payment
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Get your PDF immediately in your email and start learning today!
                    </p>
                  </div>
                </div>

                <div className="relative shrink-0">
                  <div className="w-10 h-12 bg-slate-100 border border-slate-300 rounded flex flex-col items-center justify-center text-slate-700 font-bold text-[8px]">
                    <Download className="w-3.5 h-3.5 text-slate-500 mb-0.5" />
                    PDF
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </div>
                </div>
              </div>

              {/* Box 3: Need Help Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Need Help?
                    </h5>
                    <p className="text-[11px] text-slate-500">Our support team is here for you.</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-300 hover:border-emerald-600 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  Contact Us →
                </button>
              </div>

              {/* Box 4: Mini 3-badge Row */}
              <div className="grid grid-cols-3 gap-2 py-3 px-2 text-center text-slate-600">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-semibold">100% Secure Payments</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-semibold">Instant Download</span>
                </div>
                <div className="flex flex-col items-center">
                  <Award className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-[10px] font-semibold">Trusted Worldwide</span>
                </div>
              </div>

              {/* Box 5: Calligraphy script tagline */}
              <div className="text-center pt-2 select-none">
                <div className="font-script text-2xl sm:text-3xl text-emerald-900 transform rotate-[-2deg]">
                  Better Preparation.
                </div>
                <div className="font-script text-2xl sm:text-3xl text-emerald-800 -mt-2 transform rotate-[-1deg]">
                  Brighter Future.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sleek Minimal Dark Navy Checkout Footer (Matching Mockup) */}
      <footer className="mt-14 bg-[#071d36] text-slate-300 py-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          {/* Logo on white pill */}
          <div className="inline-block bg-white p-1.5 rounded-lg shadow-xs cursor-pointer" onClick={() => setCurrentView('home')}>
            <XylemLogo size="sm" showTagline={true} />
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-slate-300 font-medium">
            <button onClick={() => setCurrentView('about')} className="hover:text-emerald-400 transition-colors cursor-pointer">About Us</button>
            <span className="text-slate-600">|</span>
            <button onClick={() => showToast('FAQ section opening...')} className="hover:text-emerald-400 transition-colors cursor-pointer">FAQ</button>
            <span className="text-slate-600">|</span>
            <button onClick={() => setIsContactModalOpen(true)} className="hover:text-emerald-400 transition-colors cursor-pointer">Contact Us</button>
            <span className="text-slate-600">|</span>
            <button onClick={() => showToast('Privacy Policy: All personal and payment information is 256-bit SSL encrypted.')} className="hover:text-emerald-400 transition-colors cursor-pointer">Privacy Policy</button>
            <span className="text-slate-600">|</span>
            <button onClick={() => showToast('Terms: Instant digital delivery upon payment verification.')} className="hover:text-emerald-400 transition-colors cursor-pointer">Terms & Conditions</button>
          </div>

          {/* Social Icons & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-7 h-7 rounded-full bg-slate-800 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                <Linkedin className="w-3.5 h-3.5" />
              </a>
            </div>
            <span className="text-[11px] text-slate-400">
              © 2025 Xylem Learning. All rights reserved.
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Payment Bar (Instant 1-Tap Mobile Conversion) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-3 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom-3 duration-200">
        <div>
          <div className="text-[10px] text-slate-500 font-medium leading-none mb-1">Total Payable</div>
          <div className="text-lg font-extrabold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
            ₹{total}
          </div>
        </div>

        <button
          id="mobile-sticky-pay-btn"
          disabled={isProcessing}
          onClick={handlePayNow}
          className="flex-1 py-3 px-5 rounded-full bg-gradient-to-r from-[#00875a] via-[#009b67] to-[#00744e] text-white text-xs font-bold font-['Plus_Jakarta_Sans',sans-serif] shadow-md shadow-emerald-700/25 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Pay ₹{total} via {paymentMethod.toUpperCase()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* PAYMENT PROCESSING OVERLAY MODAL */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-200">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="w-8 h-8 text-emerald-600" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Processing Secure Order
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Amount: ₹{total > 0 ? total : currentPrice}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-xl p-3 text-xs text-emerald-800 font-medium animate-pulse">
              {processingStatus}
            </div>

            <p className="text-[11px] text-slate-400">
              Please do not refresh or close this window while we verify your transaction.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
