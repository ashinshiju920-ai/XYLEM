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

  // Featured books
  const featuredBooks = [
    books.find((b) => b.id === 'ielts-full-prep') || books[0],
    books.find((b) => b.id === 'oet-full-prep') || books[1] || books[0],
    books.find((b) => b.id === 'pte-full-prep') || books[2] || books[0],
    books.find((b) => b.id === 'german-full-prep') || books[3] || books[0],
    books.find((b) => b.id === 'academic-study-planner') || books[4] || books[0],
  ].filter(Boolean) as Book[];

  // 4 Primary Exam Paths from Image 5
  const examPaths: {
    category: ExamCategory;
    title: string;
    description: string;
    bgImage: string;
    flag: string;
  }[] = [
    {
      category: 'IELTS',
      title: 'IELTS',
      description: 'Build your skills. Get your bands.',
      bgImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&auto=format&fit=crop&q=80',
      flag: '🇬🇧',
    },
    {
      category: 'OET',
      title: 'OET',
      description: 'Your career in healthcare, starts here.',
      bgImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80',
      flag: '🩺',
    },
    {
      category: 'PTE',
      title: 'PTE',
      description: 'Prove your English. Open global opportunities.',
      bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=80',
      flag: '🏙️',
    },
    {
      category: 'German',
      title: 'German',
      description: 'Learn German. Expand your world.',
      bgImage: 'https://images.unsplash.com/photo-1527866512907-a35a62a7f673?w=500&auto=format&fit=crop&q=80',
      flag: '🇩🇪',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION (Image 5 & Image 3) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f8fafc] via-white to-slate-50 pt-10 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Text */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider font-['DM_Sans',sans-serif]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Welcome to Xylem Learning</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0a2540] tracking-tight leading-[1.12] font-['Plus_Jakarta_Sans',sans-serif]">
                Prepare Smarter.{' '}
                <span className="text-[#00875a] block">Achieve Your Next Goal.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-['DM_Sans',sans-serif] font-normal">
                Complete preparation materials for IELTS, OET, PTE & German — designed for focused self-study and practice.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="hero-explore-btn"
                  onClick={() => navigateToCatalog('All')}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-[#00875a] text-white hover:bg-[#00734c] shadow-md shadow-emerald-700/20 active:scale-95 transition-all gap-2 font-['DM_Sans',sans-serif]"
                >
                  <span>Explore Study Materials</span>
                  <ArrowRight className="w-4 h-4" />
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
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Expert-curated materials</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Exam-focused content</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Digital + physical resources</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800">Secure checkout & fast delivery</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual (The Stack of Books from Image 5 & 3) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-lg bg-gradient-to-tr from-slate-100 to-emerald-50/50 rounded-3xl p-6 sm:p-10 border border-slate-200/70 shadow-xl overflow-hidden">
                {/* Visual quote stamp */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Better Materials. Brighter Future.
                </div>

                {/* Horizontal / Tilted showcase of books */}
                <div className="flex items-end justify-center gap-2 sm:gap-4 pt-6 pb-2">
                  <div
                    onClick={() => navigateToProduct(books[0]?.id || 'ielts-full-prep')}
                    className="transform -rotate-6 hover:rotate-0 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <BookCover book={books[0]} size="md" />
                  </div>
                  <div
                    onClick={() => navigateToProduct(books[1]?.id || books[0]?.id || 'oet-full-prep')}
                    className="transform -rotate-2 hover:rotate-0 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <BookCover book={books[1] || books[0]} size="md" />
                  </div>
                  <div
                    onClick={() => navigateToProduct(books[2]?.id || books[0]?.id || 'german-full-prep')}
                    className="transform rotate-3 hover:rotate-0 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <BookCover book={books[2] || books[0]} size="md" />
                  </div>
                  <div
                    onClick={() => navigateToProduct(books[3]?.id || books[0]?.id || 'pte-full-prep')}
                    className="transform rotate-8 hover:rotate-0 hover:-translate-y-2 transition-all duration-300 cursor-pointer hidden sm:block"
                  >
                    <BookCover book={books[3] || books[0]} size="md" />
                  </div>
                </div>

                {/* Desk reflection base */}
                <div className="mt-4 pt-4 border-t border-slate-300/60 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">Instant PDF Download</span>
                    <span className="text-slate-400">•</span>
                    <span>Optional Printed Book</span>
                  </div>
                  <button
                    onClick={() => navigateToCatalog('All')}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                  >
                    View All Guides <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CHOOSE YOUR EXAM - SELECT YOUR PATH (Image 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700 block mb-1 font-['DM_Sans',sans-serif]">
              CHOOSE YOUR EXAM
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
              Select Your Path
            </h2>
          </div>
          <button
            onClick={() => navigateToCatalog('All')}
            className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 gap-1.5 transition-colors group self-start sm:self-auto font-['DM_Sans',sans-serif]"
          >
            <span>View All Exams</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {examPaths.map((path) => (
            <div
              key={path.category}
              onClick={() => navigateToCatalog(path.category)}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-md cursor-pointer border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
            >
              {/* Background Image with Overlay */}
              <img
                src={path.bgImage}
                alt={path.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a2540] via-[#0a2540]/60 to-transparent" />

              {/* Content overlay */}
              <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                <div className="flex justify-between items-start">
                  <span className="text-2xl bg-white/20 backdrop-blur-md w-10 h-10 rounded-full flex items-center justify-center">
                    {path.flag}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] mb-1 text-white group-hover:text-emerald-300 transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed font-['DM_Sans',sans-serif]">
                    {path.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (Image 5 & Image 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-emerald-700 block mb-1 font-['DM_Sans',sans-serif]">
              FEATURED PRODUCTS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
              Popular Study Materials & Books
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-['DM_Sans',sans-serif]">
              Complete study guides with practice questions and mock tests. Download instantly or get physical delivery.
            </p>
          </div>
          <button
            onClick={() => navigateToCatalog('All')}
            className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800 gap-1.5 transition-colors group self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 5-Column or Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {featuredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div
                onClick={() => navigateToProduct(book.id)}
                className="cursor-pointer p-4 pb-0 flex flex-col items-center"
              >
                {/* Book cover visual */}
                <div className="pt-2 pb-4 transition-transform duration-300 group-hover:scale-105">
                  <BookCover book={book} size="md" />
                </div>

                {/* Rating & Review */}
                <div className="w-full flex items-center justify-between mt-2 text-xs">
                  <div className="flex items-center text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                    <span>{book.rating}</span>
                    <span className="text-slate-400 font-normal ml-1">({book.reviewCount})</span>
                  </div>
                  {book.isBestSeller && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="w-full mt-2 text-left">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 font-['Plus_Jakarta_Sans',sans-serif]">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5 font-['DM_Sans',sans-serif]">{book.subtitle}</p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-4 pt-3 border-t border-slate-100 mt-3">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    ₹{book.prices.digital.price}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-['DM_Sans',sans-serif]">
                    ₹{book.prices.digital.originalPrice}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 ml-auto font-['DM_Sans',sans-serif]">
                    {book.prices.digital.discountPercent}% OFF
                  </span>
                </div>

                <button
                  id={`buy-now-${book.id}`}
                  onClick={() => buyNow(book, 'digital')}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#00875a] hover:bg-[#00734c] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 font-['DM_Sans',sans-serif]"
                >
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DIGITAL PRODUCT TRUST BAR (Image 3) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">100% Digital Product</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                Get your study materials instantly after payment. No waiting. Just download and study!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">PDF Format (Downloadable)</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                Standard PDF compatible with phones, tablets, laptops, and printable on paper.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">Lifetime Access</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                Download anytime from your email or account. Free updates when test patterns change.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">Secure Checkout</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-['DM_Sans',sans-serif]">
                SSL 256-bit encrypted transactions through UPI, Cards, Netbanking & Razorpay.
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
