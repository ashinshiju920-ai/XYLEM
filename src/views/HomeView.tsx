import React from 'react';
import {
  ArrowRight,
  Star,
  CheckCircle2,
  BookOpen,
  Award,
  Layers,
  ShieldCheck,
  Headphones,
  FileText,
  Sparkles,
  DownloadCloud,
  ChevronRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { BookCover } from '../components/BookCover';
import { HeroBookShowcase } from '../components/HeroBookShowcase';
import { ExamCategory, Book } from '../types';

export const HomeView: React.FC = () => {
  const {
    books,
    testimonials,
    navigateToProduct,
    navigateToCatalog,
    addToCart,
    buyNow,
    openPdfViewer,
  } = useShop();

  // Featured books dynamically respect the admin's custom arrangement
  const featuredBooks = (books && books.length > 0 ? books.slice(0, 5) : []).filter(Boolean);

  // 4 Primary Exam Paths matching new reference design
  const examPaths: {
    category: ExamCategory;
    title: string;
    description: string;
    bgImage: string;
    badgeText?: string;
    isMedicalCross?: boolean;
    scriptWords: string[];
  }[] = [
    {
      category: 'IELTS',
      title: 'IELTS',
      description: 'Build your skills. Get your bands.',
      bgImage: '/images/exams/ielts.jpg',
      badgeText: 'GB',
      scriptWords: ['Study', 'Work', 'Settle'],
    },
    {
      category: 'OET',
      title: 'OET',
      description: 'Your career in healthcare, starts here.',
      bgImage: '/images/exams/oet.jpg',
      isMedicalCross: true,
      scriptWords: ['Care', 'Connect', 'Grow'],
    },
    {
      category: 'PTE',
      title: 'PTE',
      description: 'Prove your English. Open global opportunities.',
      bgImage: '/images/exams/pte.jpg',
      badgeText: 'PTE',
      scriptWords: ['Global', 'Career', 'Ahead'],
    },
    {
      category: 'German',
      title: 'German',
      description: 'Learn German. Expand your world.',
      bgImage: '/images/exams/german.jpg',
      badgeText: 'DE',
      scriptWords: ['Learn', 'Explore', 'Belong'],
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-24">
      {/* 1. HERO SECTION (Image 5 & Image 3) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-white to-slate-50 pt-8 pb-12 sm:pt-14 sm:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-left">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] sm:text-xs font-semibold font-['DM_Sans',sans-serif] shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                <span>2,840+ Active Learners Today</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0a2540] tracking-tight leading-[1.12] font-['Plus_Jakarta_Sans',sans-serif]">
                Prepare Smarter.{' '}
                <span className="text-[#00875a] block">Achieve Your Next Goal.</span>
              </h1>

              <p className="text-sm sm:text-lg text-slate-600 max-w-xl leading-relaxed font-['DM_Sans',sans-serif] font-normal">
                Complete preparation materials for IELTS, OET, PTE & German — designed for focused self-study and practice.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  id="hero-explore-btn"
                  onClick={() => navigateToCatalog('All')}
                  className="relative overflow-hidden inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-[#00875a] text-white hover:bg-[#00734c] shadow-md shadow-emerald-700/25 active:scale-95 transition-all gap-2 font-['DM_Sans',sans-serif] group"
                >
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-25 -translate-x-[200%] group-hover:animate-shimmer pointer-events-none" />
                  <span>Explore Study Materials</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-shop-books-btn"
                  onClick={() => navigateToCatalog('IELTS')}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all font-['DM_Sans',sans-serif]"
                >
                  Shop Books
                </button>
              </div>

              {/* 4 Feature Highlights Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-5 border-t border-slate-200/80">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800">Expert-curated</span>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800">Exam-focused</span>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800">Digital + physical</span>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800">Instant PDF license</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual (3D Animated Showcase with Hotspots) */}
            <div className="lg:col-span-6 relative flex items-center justify-center pt-2 lg:pt-0">
              <HeroBookShowcase />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHOOSE YOUR EXAM - SELECT YOUR PATH (Exact Match from User Reference) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-xs font-bold tracking-widest uppercase text-[#00875a] font-['DM_Sans',sans-serif]">
                CHOOSE YOUR EXAM
              </span>
              <div className="w-12 h-[1.5px] bg-[#00875a]/30" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
              Select Your Path
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-['DM_Sans',sans-serif] mt-1">
              World-class study materials and expert guidance to help you succeed.
            </p>
          </div>
          <button
            onClick={() => navigateToCatalog('All')}
            className="inline-flex items-center text-xs sm:text-sm font-bold text-[#00875a] hover:text-[#00734c] gap-1.5 transition-colors group self-start sm:self-auto font-['DM_Sans',sans-serif]"
          >
            <span>View All Exams</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 Cards Grid matching Reference Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {examPaths.map((path) => (
            <div
              key={path.category}
              onClick={() => navigateToCatalog(path.category)}
              className="group relative h-72 sm:h-80 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl cursor-pointer border border-slate-200 transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.99] touch-card flex flex-col justify-between"
            >
              {/* High-Resolution Background Image */}
              <img
                src={path.bgImage}
                alt={path.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="eager"
              />

              {/* Bottom Navy Gradient Overlay (Keeps top landmarks bright and bottom text crisp) */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#061e38] via-[#061e38]/70 via-45% to-transparent" />

              {/* Top Row: Left Badge & Right Calligraphic Script */}
              <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between">
                {/* Top-Left Circular Badge */}
                {path.isMedicalCross ? (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00875a] text-white flex items-center justify-center font-bold text-xl shadow-md border border-white/25 leading-none">
                    +
                  </div>
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#071d36]/90 backdrop-blur-md border border-white/20 text-white font-extrabold text-[11px] sm:text-xs flex items-center justify-center shadow-md tracking-wider">
                    {path.badgeText}
                  </div>
                )}

                {/* Top-Right Angled Cursive Script (Caveat font) */}
                <div className="font-script text-base sm:text-lg font-bold text-[#00875a] leading-[1.05] text-right transform -rotate-3 select-none drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
                  {path.scriptWords.map((word, i) => (
                    <div key={i}>{word}</div>
                  ))}
                </div>
              </div>

              {/* Decorative Emerald Curved Arc Accent (Matching Reference) */}
              <div className="absolute left-0 bottom-16 sm:bottom-18 w-20 h-20 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
                  <path
                    d="M 2 74 C 6 36, 28 14, 66 6"
                    stroke="#00a375"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Bottom Row: Title, Description & Action Button */}
              <div className="relative z-10 p-4 sm:p-5 pt-0 flex items-end justify-between gap-3 text-white">
                <div className="flex-1">
                  <h3 className="text-2xl sm:text-3xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif] text-white group-hover:text-emerald-300 transition-colors leading-tight">
                    {path.title}
                  </h3>
                  <p className="text-xs text-slate-200/90 leading-relaxed font-['DM_Sans',sans-serif] mt-1 line-clamp-2">
                    {path.description}
                  </p>
                </div>

                {/* Bottom-Right Teal Circular Button with Arrow */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#00a375] group-hover:bg-[#00875a] text-white flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:translate-x-0.5 shrink-0 mb-0.5">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (Image 5 & Image 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700 block mb-1 font-['DM_Sans',sans-serif]">
              FEATURED PRODUCTS
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
              Popular Study Materials & Books
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-['DM_Sans',sans-serif]">
              Complete study guides with practice questions and mock tests. Download instantly or get physical delivery.
            </p>
          </div>
          <button
            onClick={() => navigateToCatalog('All')}
            className="inline-flex items-center text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 gap-1.5 transition-colors group self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 2-Column on mobile, 5-Column on desktop for sleek catalog cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group touch-card"
            >
              <div
                onClick={() => navigateToProduct(book.id)}
                className="cursor-pointer p-3 sm:p-4 pb-0 flex flex-col items-center"
              >
                {/* Book cover visual */}
                <div className="pt-1 pb-3 transition-transform duration-300 group-hover:scale-105 scale-90 sm:scale-100">
                  <BookCover book={book} size="sm" />
                </div>

                {/* Rating & Review */}
                <div className="w-full flex items-center justify-between mt-1 text-[11px] sm:text-xs">
                  <div className="flex items-center text-amber-500 font-semibold gap-1">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 fill-amber-400 mr-1" />
                      <span>{book.rating}</span>
                      <span className="text-slate-400 font-normal ml-0.5">({book.reviewCount})</span>
                    </div>
                    {book.buyersCount !== undefined && book.buyersCount > 0 && (
                      <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">• {book.buyersCount.toLocaleString()} bought</span>
                    )}
                  </div>
                  {book.isBestSeller && (
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="w-full mt-2 text-left">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    {book.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5 font-['DM_Sans',sans-serif]">{book.subtitle}</p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-3 sm:p-4 pt-2 border-t border-slate-100 mt-2">
                <div className="flex items-baseline gap-1.5 mb-2.5">
                  <span className="text-base sm:text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    ₹{book.prices.digital.price}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through font-['DM_Sans',sans-serif]">
                    ₹{book.prices.digital.originalPrice}
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600 ml-auto font-['DM_Sans',sans-serif]">
                    {book.prices.digital.discountPercent}% OFF
                  </span>
                </div>

                <button
                  id={`buy-now-${book.id}`}
                  onClick={() => buyNow(book, 'digital')}
                  className="w-full py-2 sm:py-2.5 px-2.5 rounded-xl bg-[#00875a] hover:bg-[#00734c] text-white text-[11px] sm:text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 active:scale-95 font-['DM_Sans',sans-serif]"
                >
                  <span>Buy Now • ₹{book.prices.digital.price}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DIGITAL PRODUCT TRUST BAR (Image 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">100% Digital Product</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                Instant download after payment. No waiting!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">Downloadable PDF</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                Printable and works on all phones and tablets.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">Lifetime Access</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                Free future updates whenever syllabus changes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">Secure Checkout</h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                SSL 256-bit encrypted transactions via UPI & Cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY XYLEM LEARNING (Image 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700 block mb-1 font-['DM_Sans',sans-serif]">
            WHY XYLEM LEARNING
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
            More Than Just Books. A Complete Learning Partner.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Structured learning materials
            </h4>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Updated exam-focused resources
            </h4>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Designed for self-study
            </h4>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Clear explanations & practice
            </h4>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Headphones className="w-6 h-6" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              Reliable customer support
            </h4>
          </div>
        </div>
      </section>

      {/* 6. WHAT OUR LEARNERS SAY (Image 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700 block mb-1 font-['DM_Sans',sans-serif]">
              REAL STORIES. REAL RESULTS.
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
              What Our Learners Say
            </h2>
          </div>
          <button
            onClick={() => navigateToCatalog('All')}
            className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 gap-1.5 transition-colors group self-start sm:self-auto font-['DM_Sans',sans-serif]"
          >
            <span>View More Reviews</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed italic font-['DM_Sans',sans-serif]">
                  "{t.quote}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">{t.name}</h4>
                  <p className="text-xs text-emerald-700 font-semibold font-['DM_Sans',sans-serif]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FREE RESOURCES (Image 5) */}
      <section className="bg-[#0b1f33] py-12 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4">
              <span className="text-xs font-semibold tracking-widest uppercase text-emerald-400 block mb-1 font-['DM_Sans',sans-serif]">
                FREE RESOURCES
              </span>
              <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white">
                Learn More. For Free.
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-['DM_Sans',sans-serif]">
                Access free study resources, sample chapters, and useful tips to kickstart your preparation today.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { title: 'IELTS Vocabulary', action: 'Download Now', book: books[0] },
                { title: 'OET Practice', action: 'Explore Now', book: books[1] || books[0] },
                { title: 'PTE Tips', action: 'View Resources', book: books[3] || books[0] },
                { title: 'German Learning', action: 'Get Started', book: books[2] || books[0] },
                { title: 'Free PDFs', action: 'Download Now', book: books[0] },
              ].map((res, i) => (
                <button
                  key={i}
                  onClick={() => openPdfViewer(res.book)}
                  className="bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-3.5 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-white font-['Plus_Jakarta_Sans',sans-serif] group-hover:text-emerald-300">
                    {res.title}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold mt-2 flex items-center gap-1 font-['DM_Sans',sans-serif]">
                    <span>{res.action}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER (Image 5 & Image 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-[#0a2540] via-[#0f3459] to-[#041525] p-8 sm:p-12 text-white">
          <div className="max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              Prepare smarter. <br />
              Learn with Xylem.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-['DM_Sans',sans-serif]">
              Your goals. Our materials. A brighter future.
            </p>
            <div className="pt-2">
              <button
                id="cta-shop-now-btn"
                onClick={() => navigateToCatalog('All')}
                className="inline-flex items-center justify-center px-7 py-3 rounded-xl text-sm font-semibold bg-[#00875a] text-white hover:bg-[#00734c] transition-all gap-2 shadow-lg font-['DM_Sans',sans-serif]"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
