import React, { useState, useRef } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Star,
  ShoppingBag,
  Plus,
  Trash2,
  Edit3,
  Upload,
  ExternalLink,
  Eye,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  DownloadCloud,
  Layers,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Tag,
  BookMarked,
  ShieldCheck,
  Percent,
  Copy,
  Loader2,
  Wifi,
  Radio,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ArrowUpDown,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Book, ExamCategory, BookFormat, Testimonial, Review } from '../types';
import { BookCover } from '../components/BookCover';
import { uploadImageToCloudinary } from '../utils/cloudSync';

export const AdminView: React.FC = () => {
  const {
    books,
    addBook,
    updateBook,
    deleteBook,
    resetBooksToDefault,
    reorderBooks,
    moveBookOrder,
    setBookOrderPosition,
    testimonials,
    addTestimonial,
    deleteTestimonial,
    addReview,
    orders,
    openPdfViewer,
    setCurrentView,
    navigateToProduct,
    showToast,
    isCloudSyncing,
    lastCloudSync,
    refreshProductsFromCloud,
    syncBooksToCloud,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'arrange' | 'pdfs' | 'reviews' | 'orders'>('overview');

  // Products filter
  const [productCategoryFilter, setProductCategoryFilter] = useState<ExamCategory | 'All'>('All');
  const [productSearch, setProductSearch] = useState('');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);

  // New / Edit Book Form Data
  const initialBookForm: Omit<Book, 'id'> = {
    title: '',
    subtitle: '',
    category: 'IELTS',
    type: 'Study Guides',
    isBestSeller: false,
    isNew: true,
    rating: 5.0,
    reviewCount: 1,
    description: '',
    longDescription: '',
    features: ['Official Exam Syllabus 2026', 'Step-by-Step Solved Questions', 'Examiner Tips & High-Band Vocabulary'],
    whatYouGet: ['Full PDF eBook with printable worksheets', 'Audio transcripts & answer keys', 'Lifetime access to digital updates'],
    tableOfContents: [
      { chapter: 'Chapter 1: Diagnostic Assessment & Strategy', pages: 'pp. 1-28' },
      { chapter: 'Chapter 2: Core Fundamentals & Scoring Criteria', pages: 'pp. 29-74' },
      { chapter: 'Chapter 3: High-Yield Practice Modules', pages: 'pp. 75-160' },
      { chapter: 'Chapter 4: Full-Length Timed Mock Tests', pages: 'pp. 161-240' },
    ],
    prices: {
      digital: { price: 499, originalPrice: 999, discountPercent: 50 },
      physical: { price: 899, originalPrice: 1499, discountPercent: 40 },
    },
    coverTheme: {
      bgGradient: 'from-emerald-800 via-teal-900 to-slate-900',
      accentColor: 'text-emerald-400',
      textColor: 'text-white',
      badgeText: '2026 OFFICIAL GUIDE',
    },
    samplePdfName: 'Xylem_Official_Guide_Sample.pdf',
    pdfUrl: '',
    imageUrl: '',
    images: [],
    adLink: '',
    adText: 'Buy on Amazon / Partner Site',
    totalPages: 240,
    reviews: [],
  };

  const [bookFormData, setBookFormData] = useState<Omit<Book, 'id'>>(initialBookForm);
  const [featureInput, setFeatureInput] = useState('');
  const [whatYouGetInput, setWhatYouGetInput] = useState('');
  const [productSkuInput, setProductSkuInput] = useState<string>('PROD-1029');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [activeSlotUploading, setActiveSlotUploading] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'idle' | 'uploading' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });
  const bookImageInputRef = useRef<HTMLInputElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);
  const [targetSlotToUpload, setTargetSlotToUpload] = useState<number>(0);

  // PDF Manager State
  const [selectedBookForPdf, setSelectedBookForPdf] = useState<string>(books[0]?.id || '');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [pdfFileBase64, setPdfFileBase64] = useState<string>('');
  const [pdfExternalUrl, setPdfExternalUrl] = useState<string>('');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Review & Testimonial State
  const [reviewSubTab, setReviewSubTab] = useState<'book-reviews' | 'testimonials'>('book-reviews');
  const [selectedBookForReview, setSelectedBookForReview] = useState<string>(books[0]?.id || '');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewBand, setReviewBand] = useState('Band 8.0 Achieved');
  const [reviewComment, setReviewComment] = useState('');

  // Testimonial Form
  const [testiName, setTestiName] = useState('');
  const [testiRole, setTestiRole] = useState('IELTS Academic • Band 8.5');
  const [testiQuote, setTestiQuote] = useState('');
  const [testiRating, setTestiRating] = useState<number>(5);
  const [testiAvatarUrl, setTestiAvatarUrl] = useState('');
  const [testiAvatarBase64, setTestiAvatarBase64] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Delete Confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'book' | 'testimonial' | null>(null);

  // Predefined Cover Gradients
  const gradientPresets = [
    { label: 'Emerald Deep', value: 'from-emerald-800 via-teal-900 to-slate-900', accent: 'text-emerald-400' },
    { label: 'Navy Blue', value: 'from-blue-900 via-slate-900 to-black', accent: 'text-blue-400' },
    { label: 'Purple Royal', value: 'from-purple-900 via-indigo-950 to-slate-950', accent: 'text-purple-400' },
    { label: 'Sunset Amber', value: 'from-amber-800 via-orange-900 to-slate-900', accent: 'text-amber-400' },
    { label: 'Ruby Red', value: 'from-rose-900 via-red-950 to-slate-900', accent: 'text-rose-400' },
    { label: 'Cyber Teal', value: 'from-cyan-900 via-slate-900 to-slate-950', accent: 'text-cyan-400' },
  ];

  // Overview metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalProducts = books.length;
  const totalPdfs = books.filter((b) => b.pdfUrl).length;
  const totalAdLinks = books.filter((b) => b.adLink).length;
  const totalReviewsCount =
    testimonials.length +
    books.reduce((sum, b) => sum + (b.reviews?.length || 0), 0);

  // Handle Opening Product Edit
  const handleOpenEditBook = (book: Book) => {
    setEditingBookId(book.id);
    const existingImages = book.images && Array.isArray(book.images) && book.images.length > 0
      ? [...book.images]
      : book.imageUrl
        ? [book.imageUrl]
        : [];

    setBookFormData({
      title: book.title,
      subtitle: book.subtitle,
      category: book.category,
      type: book.type,
      isBestSeller: book.isBestSeller ?? false,
      isNew: book.isNew ?? false,
      rating: book.rating,
      reviewCount: book.reviewCount,
      description: book.description,
      longDescription: book.longDescription,
      features: [...book.features],
      whatYouGet: [...book.whatYouGet],
      tableOfContents: [...book.tableOfContents],
      prices: {
        digital: { ...book.prices.digital },
        physical: { ...book.prices.physical },
      },
      coverTheme: { ...book.coverTheme },
      samplePdfName: book.samplePdfName || 'sample.pdf',
      pdfUrl: book.pdfUrl || '',
      imageUrl: book.imageUrl || existingImages[0] || '',
      images: existingImages,
      adLink: book.adLink || '',
      adText: book.adText || '',
      totalPages: book.totalPages || 200,
      reviews: book.reviews ? [...book.reviews] : [],
      order: book.order,
    });
    setProductSkuInput(book.id || 'PROD-1029');
    setUploadStatus({ type: 'idle', message: '' });
    setIsProductModalOpen(true);
  };

  // Handle Opening Add New Product
  const handleOpenAddNewBook = () => {
    setEditingBookId(null);
    setProductSkuInput(`PROD-${Math.floor(1000 + Math.random() * 9000)}`);
    setUploadStatus({ type: 'idle', message: '' });
    setBookFormData({
      ...initialBookForm,
      images: [],
    });
    setIsProductModalOpen(true);
  };

  // Handle Uploading Product Image (Slot 0-3) via Cloudflare Edge / Cloudinary & Real-Time Sync
  const handleUploadSlotImage = async (file: File, slotIndex: number) => {
    if (!file) return;

    setActiveSlotUploading(slotIndex);
    setIsUploadingImage(true);
    setUploadStatus({ type: 'uploading', message: `Uploading Image (Slot ${slotIndex + 1}) to Cloudinary...` });

    const sku = productSkuInput.trim() || editingBookId || `PROD-${Date.now()}`;

    try {
      const uploadedUrl = await uploadImageToCloudinary(file, `${sku}_slot${slotIndex + 1}`);
      const currentImages = [...(bookFormData.images || [])];
      currentImages[slotIndex] = uploadedUrl;
      const nextImages = currentImages.filter(Boolean).slice(0, 4);
      const nextCover = slotIndex === 0 || !bookFormData.imageUrl ? uploadedUrl : bookFormData.imageUrl;

      setBookFormData((prev) => ({
        ...prev,
        images: nextImages,
        imageUrl: nextCover,
      }));

      setUploadStatus({ type: 'success', message: `Slot ${slotIndex + 1} image uploaded to Cloudinary!` });
      showToast(`Image ${slotIndex + 1} uploaded & saved!`, 'success');

      // If currently editing an existing product, immediately sync image change live to all users!
      if (editingBookId) {
        updateBook(editingBookId, {
          images: nextImages,
          imageUrl: nextCover,
        });
        showToast('Product images synced in real time to all users!', 'success');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      setUploadStatus({ type: 'error', message: 'Error: ' + err.message });
      showToast(`Upload failed: ${err.message}`, 'warning');
    } finally {
      setIsUploadingImage(false);
      setActiveSlotUploading(null);
    }
  };

  const handleRemoveSlotImage = (slotIndex: number) => {
    const currentImages = [...(bookFormData.images || [])];
    currentImages.splice(slotIndex, 1);
    const nextCover = currentImages[0] || '';
    setBookFormData((prev) => ({
      ...prev,
      images: currentImages,
      imageUrl: nextCover,
    }));
    if (editingBookId) {
      updateBook(editingBookId, {
        images: currentImages,
        imageUrl: nextCover,
      });
      showToast('Image removed and synced live!', 'info');
    }
  };

  const handleSetSlotAsCover = (slotIndex: number) => {
    const currentImages = [...(bookFormData.images || [])];
    if (slotIndex <= 0 || slotIndex >= currentImages.length) return;
    const [selected] = currentImages.splice(slotIndex, 1);
    currentImages.unshift(selected);
    setBookFormData((prev) => ({
      ...prev,
      images: currentImages,
      imageUrl: selected,
    }));
    if (editingBookId) {
      updateBook(editingBookId, {
        images: currentImages,
        imageUrl: selected,
      });
      showToast('Cover image updated & synced live!', 'success');
    }
  };

  const handleUploadProductImage = async (file: File) => {
    await handleUploadSlotImage(file, 0);
  };

  const handleSetSlotImageUrl = (slotIndex: number, url: string) => {
    const trimmed = url.trim();
    const currentImages = [...(bookFormData.images || [])];
    currentImages[slotIndex] = trimmed;
    const nextImages = currentImages.filter(Boolean).slice(0, 4);
    const nextCover = slotIndex === 0 || !bookFormData.imageUrl ? trimmed : bookFormData.imageUrl;

    setBookFormData((prev) => ({
      ...prev,
      images: nextImages,
      imageUrl: nextCover,
    }));

    if (editingBookId) {
      updateBook(editingBookId, {
        images: nextImages,
        imageUrl: nextCover,
      });
      showToast(`Slot ${slotIndex + 1} image updated & synced live!`, 'success');
    }
  };

  // Save Book Form (Create or Update)
  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookFormData.title.trim()) {
      showToast('Book title is required', 'warning');
      return;
    }

    const finalImages = (bookFormData.images && bookFormData.images.length > 0)
      ? bookFormData.images.filter(Boolean).slice(0, 4)
      : (bookFormData.imageUrl ? [bookFormData.imageUrl] : []);
    const finalCover = finalImages[0] || bookFormData.imageUrl || '';

    const payload = {
      ...bookFormData,
      images: finalImages,
      imageUrl: finalCover,
    };

    if (editingBookId) {
      updateBook(editingBookId, payload);
      showToast(`Updated "${bookFormData.title}" successfully!`, 'success');
    } else {
      const newBook: Book = {
        ...payload,
        id: `book-${Date.now()}`,
      };
      addBook(newBook);
      showToast(`Added "${newBook.title}" to catalog!`, 'success');
    }

    setIsProductModalOpen(false);
  };

  // Handle PDF File Selection
  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please upload a valid .pdf file', 'warning');
        return;
      }
      setPdfFileName(file.name);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setPdfFileBase64(base64);
        showToast(`Loaded PDF: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Assign PDF to Target Book
  const handleAttachPdf = () => {
    const targetBook = books.find((b) => b.id === selectedBookForPdf);
    if (!targetBook) {
      showToast('Please select a book', 'warning');
      return;
    }

    const finalPdfUrl = pdfFileBase64 || pdfExternalUrl;
    if (!finalPdfUrl) {
      showToast('Please upload a PDF file or enter a valid PDF URL', 'warning');
      return;
    }

    updateBook(targetBook.id, {
      pdfUrl: finalPdfUrl,
      samplePdfName: pdfFileName || targetBook.samplePdfName,
    });

    showToast(`PDF successfully linked to "${targetBook.title}"!`, 'success');
    setPdfFileBase64('');
    setPdfFileName('');
    setPdfExternalUrl('');
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  // Handle Testimonial Avatar File Upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setTestiAvatarBase64(base64);
        showToast('Photo uploaded successfully!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Book Review
  const handleAddBookReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      showToast('Please fill out reviewer name and comments', 'warning');
      return;
    }

    addReview(selectedBookForReview, {
      author: reviewAuthor.trim(),
      rating: reviewRating,
      bandOrScore: reviewBand.trim(),
      comment: reviewComment.trim(),
      verified: true,
    });

    setReviewAuthor('');
    setReviewComment('');
    showToast('Review added to book!', 'success');
  };

  // Submit Student Testimonial
  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testiName.trim() || !testiQuote.trim()) {
      showToast('Please enter student name and testimonial quote', 'warning');
      return;
    }

    const finalAvatar =
      testiAvatarBase64 ||
      testiAvatarUrl ||
      `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&q=80&w=200`;

    addTestimonial({
      name: testiName.trim(),
      role: testiRole.trim(),
      quote: testiQuote.trim(),
      rating: testiRating,
      avatar: finalAvatar,
    });

    setTestiName('');
    setTestiQuote('');
    setTestiAvatarBase64('');
    setTestiAvatarUrl('');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
    showToast('Student testimonial published to homepage!', 'success');
  };

  // Filtered books
  const filteredBooks = books.filter((b) => {
    const matchesCategory = productCategoryFilter === 'All' || b.category === productCategoryFilter;
    const matchesSearch =
      b.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      b.subtitle.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-['DM_Sans',sans-serif]">
      {/* Top Admin Navigation Bar */}
      <div className="sticky top-0 z-30 bg-[#0a2540] text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand / Admin Title */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-inner">
                X
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                    Xylem Learning
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Content Management & Publisher Studio</p>
              </div>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => resetBooksToDefault()}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="Reset books, tests and reviews to default"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() => setCurrentView('home')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00875a] hover:bg-[#00734c] text-white shadow-sm transition-all active:scale-95"
              >
                <Eye className="w-4 h-4" />
                <span>View Live Store</span>
              </button>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex items-center space-x-1 sm:space-x-4 overflow-x-auto border-t border-slate-800 pt-1 pb-2">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
              { id: 'products', label: `Products & Books (${books.length})`, icon: BookOpen },
              { id: 'arrange', label: 'Arrange Homepage Order', icon: ArrowUpDown },
              { id: 'pdfs', label: `PDF Manager (${totalPdfs})`, icon: FileText },
              { id: 'reviews', label: `Reviews & Testimonials (${totalReviewsCount})`, icon: Star },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* =========================================================================
            TAB 1: OVERVIEW
            ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</p>
                  <h3 className="text-2xl font-black text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif] mt-1">
                    {totalProducts}
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 4 Exam Categories
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales</p>
                  <h3 className="text-2xl font-black text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif] mt-1">
                    ₹{totalRevenue.toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> {orders.length} orders placed
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PDFs Attached</p>
                  <h3 className="text-2xl font-black text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif] mt-1">
                    {totalPdfs}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    of {totalProducts} books available
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Ad Links</p>
                  <h3 className="text-2xl font-black text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif] mt-1">
                    {totalAdLinks}
                  </h3>
                  <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" /> External redirects
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Tag className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#0a2540] to-[#071d36] text-white p-6 rounded-3xl shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-['Plus_Jakarta_Sans',sans-serif]">Publish New Book</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Add new study guides, practice sets, dual pricing (Digital/Physical), and custom cover gradients.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddNewBook}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" /> Add Product Now
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Upload & Link PDF
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload official PDF files for sample reading or full digital downloads. Stored locally in base64.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('pdfs')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Go to PDF Manager
                </button>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Reviews & Photos
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Add verified student reviews with band scores and upload student avatar photos directly from your disk.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" /> Manage Reviews
                </button>
              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    Recent Store Orders
                  </h4>
                  <p className="text-xs text-slate-500">Live order activity from the checkout gateway</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No customer orders placed yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Orders completed via the checkout view will show up here in real-time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3">Order ID</th>
                        <th className="px-6 py-3">Customer</th>
                        <th className="px-6 py-3">Format</th>
                        <th className="px-6 py-3">Total Amount</th>
                        <th className="px-6 py-3">Payment</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/60">
                          <td className="px-6 py-3 font-mono font-bold text-slate-900">{order.id}</td>
                          <td className="px-6 py-3">
                            <p className="font-semibold text-slate-900">{order.shipping.fullName}</p>
                            <p className="text-[10px] text-slate-400">{order.shipping.email}</p>
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                order.shipping.deliveryOption === 'digital'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {order.shipping.deliveryOption === 'digital' ? 'PDF Download' : 'Physical Delivery'}
                            </span>
                          </td>
                          <td className="px-6 py-3 font-bold text-slate-900">₹{order.total}</td>
                          <td className="px-6 py-3 uppercase text-[10px] font-bold text-slate-600">
                            {order.paymentMethod}
                          </td>
                          <td className="px-6 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: PRODUCTS & BOOKS (CRUD)
            ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Real-time Cloud Sync Banner */}
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-[#0a2540] text-white p-4 rounded-2xl border border-emerald-500/30 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-1.5 text-white">
                      <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      <span>Cloudinary Live Real-Time Sync</span>
                    </h5>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live to all users
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Images uploaded or updated are synced instantly to all active store visitors globally in real-time.
                    {lastCloudSync && (
                      <span className="ml-1 text-emerald-300 font-medium">
                        • Synced at {lastCloudSync.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => refreshProductsFromCloud()}
                  disabled={isCloudSyncing}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  title="Check Cloudinary for remote catalog updates"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span>{isCloudSyncing ? 'Syncing...' : 'Sync with Cloud'}</span>
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {(['All', 'IELTS', 'OET', 'PTE', 'German'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                      productCategoryFilter === cat
                        ? 'bg-[#0a2540] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat} {cat !== 'All' && `(${books.filter((b) => b.category === cat).length})`}
                  </button>
                ))}
              </div>

              {/* Search & Add New CTA */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>

                <button
                  onClick={handleOpenAddNewBook}
                  className="px-4 py-2 bg-[#00875a] hover:bg-[#00734c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Book</span>
                </button>
              </div>
            </div>

            {/* Products Table/Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                        {book.category}
                      </span>
                      {book.isBestSeller && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md">
                          Best Seller
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {book.imageUrl && (
                        <span
                          className="p-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1"
                          title="Cloudinary Product Image"
                        >
                          <ImageIcon className="w-3 h-3" /> Image
                        </span>
                      )}
                      {book.pdfUrl && (
                        <span
                          className="p-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold flex items-center gap-1"
                          title="Custom PDF Attached"
                        >
                          <FileText className="w-3 h-3" /> PDF
                        </span>
                      )}
                      {book.adLink && (
                        <span
                          className="p-1 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold flex items-center gap-1"
                          title="External Ad Link Active"
                        >
                          <ExternalLink className="w-3 h-3" /> Ad
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Book Visual and Info */}
                  <div className="flex gap-4 items-start mb-4">
                    <div className="w-20 shrink-0">
                      <BookCover book={book} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{book.subtitle}</p>

                      {/* Pricing Tag */}
                      <div className="mt-3 flex items-center gap-3">
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Digital</p>
                          <p className="text-xs font-extrabold text-slate-900">₹{book.prices.digital.price}</p>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Physical</p>
                          <p className="text-xs font-extrabold text-slate-900">₹{book.prices.physical.price}</p>
                        </div>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Rating</p>
                          <p className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                            ★ {book.rating}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ad Link Preview if present */}
                  {book.adLink && (
                    <div className="mb-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                      <span className="truncate max-w-[200px]">Ad: {book.adText || book.adLink}</span>
                      <a
                        href={book.adLink}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1 font-bold text-amber-900 shrink-0"
                      >
                        Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Card Bottom Controls */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => navigateToProduct(book.id)}
                      className="px-2.5 py-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      title="Preview product page"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditBook(book)}
                        className="px-3 py-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeleteConfirmId(book.id);
                          setDeleteType('book');
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB: ARRANGE HOMEPAGE ORDER
            ========================================================================= */}
        {activeTab === 'arrange' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Real-time Cloud Sync Banner */}
            <div className="bg-gradient-to-r from-[#0a2540] via-slate-900 to-emerald-950 text-white p-6 rounded-3xl border border-emerald-500/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <ArrowUpDown className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-black text-white font-['Plus_Jakarta_Sans',sans-serif]">
                    Arrange Storefront Homepage Products
                  </h3>
                  <span className="text-[10px] uppercase font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                    Live Ordering
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1.5 max-w-2xl">
                  Reorder and customize the exact sequence of products displayed on the main storefront homepage. 
                  The <strong className="text-emerald-300">Top 5 products</strong> will be prominently showcased in the &ldquo;Most Popular &amp; Best-selling Courses&rdquo; section on the homepage.
                  Any order change syncs live to all active devices in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    syncBooksToCloud(books);
                    showToast('Catalog order synced with cloud in real-time!', 'success');
                  }}
                  disabled={isCloudSyncing}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCloudSyncing ? 'animate-spin' : ''}`} />
                  <span>{isCloudSyncing ? 'Syncing...' : 'Sync Order to Cloud'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#00875a] hover:bg-[#00734c] text-white shadow-sm transition-all flex items-center gap-2 active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Live Homepage</span>
                </button>
              </div>
            </div>

            {/* Product Sequence Reordering List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Active Catalog Display Sequence ({books.length} Products)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Use ▲ / ▼ buttons or select target position to reorder
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {books.map((book, index) => {
                  const isTopFive = index < 5;
                  const isFirst = index === 0;
                  const isLast = index === books.length - 1;

                  return (
                    <div
                      key={book.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                        isTopFive ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Left: Position Rank & Book Info */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Position Rank Badge */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-12 text-center">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs ${
                              isTopFive
                                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            #{index + 1}
                          </div>
                          {isTopFive && (
                            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-700 mt-1">
                              Featured
                            </span>
                          )}
                        </div>

                        {/* Book Thumbnail / Cover */}
                        <div className="w-12 shrink-0">
                          <BookCover book={book} size="sm" />
                        </div>

                        {/* Title, Subtitle, Pricing */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {book.category}
                            </span>
                            <span className="text-[9px] font-medium text-slate-500">
                              {book.type}
                            </span>
                            {book.isBestSeller && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                Bestseller
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                            {book.title}
                          </h5>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {book.subtitle}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                            <span className="font-bold text-[#0a2540]">₹{book.prices.digital.price}</span>
                            <span className="text-slate-300">•</span>
                            <span>{book.images && book.images.length > 0 ? `${book.images.length} Image(s)` : 'Cover Image'}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-[10px] text-slate-400">{book.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Interactive Reordering Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Jump to Position Dropdown */}
                        <div className="flex items-center gap-1.5 mr-2">
                          <span className="text-[11px] font-bold text-slate-500 hidden md:inline">Position:</span>
                          <select
                            value={index + 1}
                            onChange={(e) => {
                              const newPos = parseInt(e.target.value, 10);
                              if (!isNaN(newPos)) {
                                setBookOrderPosition(book.id, newPos);
                                showToast(`Moved "${book.title}" to position #${newPos}`, 'success');
                              }
                            }}
                            className="px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:border-slate-400 text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500"
                            title="Directly select position number"
                          >
                            {books.map((_, i) => (
                              <option key={i + 1} value={i + 1}>
                                #{i + 1} {i < 5 ? '★ (Homepage Featured)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Move To Top Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setBookOrderPosition(book.id, 1);
                            showToast(`"${book.title}" moved to top position (#1)!`, 'success');
                          }}
                          disabled={isFirst}
                          className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move directly to Top (#1)"
                        >
                          <ChevronsUp className="w-4 h-4" />
                        </button>

                        {/* Move Up Button */}
                        <button
                          type="button"
                          onClick={() => {
                            moveBookOrder(book.id, 'up');
                            showToast(`Moved "${book.title}" up`, 'info');
                          }}
                          disabled={isFirst}
                          className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move up 1 position"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>

                        {/* Move Down Button */}
                        <button
                          type="button"
                          onClick={() => {
                            moveBookOrder(book.id, 'down');
                            showToast(`Moved "${book.title}" down`, 'info');
                          }}
                          disabled={isLast}
                          className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title="Move down 1 position"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Quick Edit Trigger */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditBook(book)}
                          className="p-2 rounded-xl text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 transition-colors ml-1"
                          title="Edit product details & images"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: PDF & SAMPLE UPLOADER
            ========================================================================= */}
        {activeTab === 'pdfs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
            {/* Left Upload Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
                  Upload & Link PDF File
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload PDF documents for sample page previews and digital customer downloads. Files are converted to secure Base64 data and persisted.
                </p>
              </div>

              {/* Target Book Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Product / Book
                </label>
                <select
                  value={selectedBookForPdf}
                  onChange={(e) => setSelectedBookForPdf(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      [{b.category}] {b.title} {b.pdfUrl ? '✓ (Has PDF)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag & Drop / File Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Upload Local PDF Document (.pdf)
                </label>
                <div
                  onClick={() => pdfInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-emerald-50/20 flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {pdfFileName ? pdfFileName : 'Click to select or drop a PDF here'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Supports official syllabus, sample chapters, or full guides</p>
                  </div>
                </div>
                <input
                  type="file"
                  ref={pdfInputRef}
                  onChange={handlePdfFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
              </div>

              {/* Or External PDF URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Or External Cloud / CDN PDF URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/books/sample-ielts.pdf"
                  value={pdfExternalUrl}
                  onChange={(e) => setPdfExternalUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Submit */}
              <button
                onClick={handleAttachPdf}
                className="w-full py-3 bg-[#00875a] hover:bg-[#00734c] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>Attach PDF to Book</span>
              </button>
            </div>

            {/* Right Books List with PDF Status */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    PDF Catalog Status
                  </h4>
                  <p className="text-xs text-slate-500">Manage all book attachments and reader previews</p>
                </div>
                <span className="text-xs font-bold bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                  {totalPdfs} of {books.length} Connected
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {books.map((book) => (
                  <div key={book.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 shrink-0">
                        <BookCover book={book} size="sm" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {book.category}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 truncate">{book.title}</h5>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                          Filename: {book.samplePdfName || 'default_sample.pdf'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {book.pdfUrl ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Custom PDF Linked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Default Academic PDF Engine
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openPdfViewer(book)}
                        className="p-2 text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Preview PDF in Built-in Reader"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      {book.pdfUrl && (
                        <button
                          onClick={() => {
                            updateBook(book.id, { pdfUrl: undefined });
                            showToast(`Removed custom PDF from "${book.title}"`, 'info');
                          }}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Unlink PDF"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: REVIEWS & TESTIMONIALS MANAGER
            ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
              <button
                onClick={() => setReviewSubTab('book-reviews')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  reviewSubTab === 'book-reviews'
                    ? 'bg-[#0a2540] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Book-Specific Reviews ({books.reduce((s, b) => s + (b.reviews?.length || 0), 0)})
              </button>

              <button
                onClick={() => setReviewSubTab('testimonials')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  reviewSubTab === 'testimonials'
                    ? 'bg-[#0a2540] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                }`}
              >
                Homepage Student Testimonials with Photos ({testimonials.length})
              </button>
            </div>

            {/* Subtab 1: Book Reviews */}
            {reviewSubTab === 'book-reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Add Review Form */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
                      Add Verified Book Review
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Post a genuine high-band score review. Automatically recalibrates the book's overall rating.
                    </p>
                  </div>

                  <form onSubmit={handleAddBookReview} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Select Book</label>
                      <select
                        value={selectedBookForReview}
                        onChange={(e) => setSelectedBookForReview(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                      >
                        {books.map((b) => (
                          <option key={b.id} value={b.id}>
                            [{b.category}] {b.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700">Reviewer Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Nair"
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700">Band / Score</label>
                        <input
                          type="text"
                          placeholder="e.g. Band 8.5 Achieved"
                          value={reviewBand}
                          onChange={(e) => setReviewBand(e.target.value)}
                          className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">Star Rating</label>
                      <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">{reviewRating}.0 Stars</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">Student Feedback / Comment</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Share how this book helped them pass their exam..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#00875a] hover:bg-[#00734c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>Publish Verified Review</span>
                    </button>
                  </form>
                </div>

                {/* Existing Reviews List */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Reviews for Selected Book
                    </h4>
                    <span className="text-xs text-slate-500">
                      {books.find((b) => b.id === selectedBookForReview)?.reviews?.length || 0} reviews
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {(() => {
                      const currentBook = books.find((b) => b.id === selectedBookForReview);
                      const reviewsList = currentBook?.reviews || [];

                      if (reviewsList.length === 0) {
                        return (
                          <div className="text-center py-10 text-slate-400 text-xs">
                            No custom reviews added yet for "{currentBook?.title}". Add the first one using the form on the left!
                          </div>
                        );
                      }

                      return reviewsList.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{rev.author}</span>
                            <span className="text-slate-400 text-[10px]">{rev.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center text-amber-400">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                  }`}
                                />
                              ))}
                            </div>
                            {rev.bandOrScore && (
                              <span className="text-emerald-700 font-bold text-[11px]">{rev.bandOrScore}</span>
                            )}
                          </div>
                          <p className="text-slate-600 mt-1">{rev.comment}</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Subtab 2: Student Testimonials with Image Upload */}
            {reviewSubTab === 'testimonials' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form to Add Testimonial */}
                <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
                      Add Student Testimonial with Photo
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Featured on the store homepage carousel to build student trust and brand credibility.
                    </p>
                  </div>

                  <form onSubmit={handleAddTestimonial} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Student Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sandra Mathew"
                        value={testiName}
                        onChange={(e) => setTestiName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">Role / Exam Achievement</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. OET Nursing • Grade A • NHS UK"
                        value={testiRole}
                        onChange={(e) => setTestiRole(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                      />
                    </div>

                    {/* Image / Avatar Upload (Base64 or URL) */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Student Photo / Avatar</label>
                      <div className="flex items-center gap-3">
                        {/* Live Avatar Preview */}
                        <div className="w-14 h-14 rounded-full border-2 border-emerald-500 overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                          {testiAvatarBase64 || testiAvatarUrl ? (
                            <img
                              src={testiAvatarBase64 || testiAvatarUrl}
                              alt="Avatar preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Local Image</span>
                          </button>
                          <input
                            type="file"
                            ref={avatarInputRef}
                            onChange={handleAvatarFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <input
                            type="url"
                            placeholder="Or paste image URL"
                            value={testiAvatarUrl}
                            onChange={(e) => setTestiAvatarUrl(e.target.value)}
                            className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 bg-slate-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">Testimonial Quote</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="The mock tests and feedback were directly relevant to the actual exam day..."
                        value={testiQuote}
                        onChange={(e) => setTestiQuote(e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#00875a] hover:bg-[#00734c] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Publish Testimonial</span>
                    </button>
                  </form>
                </div>

                {/* Testimonials List with Photos */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                      Active Homepage Testimonials ({testimonials.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto">
                    {testimonials.map((testi) => (
                      <div
                        key={testi.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 relative group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={testi.avatar}
                            alt={testi.name}
                            className="w-11 h-11 rounded-full object-cover border border-emerald-500 shadow-xs"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 truncate">{testi.name}</h5>
                            <p className="text-[10px] text-emerald-700 font-semibold truncate">{testi.role}</p>
                            <div className="flex items-center text-amber-400 mt-0.5">
                              {[...Array(testi.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 italic line-clamp-3">"{testi.quote}"</p>

                        <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                          <button
                            onClick={() => {
                              setDeleteConfirmId(testi.id);
                              setDeleteType('testimonial');
                            }}
                            className="text-[11px] text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 5: ORDERS
            ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0a2540] font-['Plus_Jakarta_Sans',sans-serif]">
                  Orders & Transaction Ledger
                </h3>
                <p className="text-xs text-slate-500">Live logs of customer payments, receipts, and delivery details</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-400">Total Volume: </span>
                <span className="text-sm font-extrabold text-emerald-700">₹{totalRevenue}</span>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">No Orders in History</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  When customers purchase IELTS, OET, PTE, or German study materials, orders are logged here with shipping and payment receipts.
                </p>
                <button
                  onClick={() => setCurrentView('home')}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-500 transition-colors"
                >
                  Visit Store & Place a Test Order
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">Order ID & Date</th>
                      <th className="px-6 py-3.5">Learner / Buyer</th>
                      <th className="px-6 py-3.5">Items Purchased</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Payment Method</th>
                      <th className="px-6 py-3.5">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <p className="font-mono font-bold text-slate-900">{order.id}</p>
                          <p className="text-[10px] text-slate-400">{order.date}</p>
                          <p className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">
                            {order.paymentId}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{order.shipping.fullName}</p>
                          <p className="text-[11px] text-slate-500">{order.shipping.phone}</p>
                          <p className="text-[10px] text-slate-400">{order.shipping.email}</p>
                          {order.shipping.addressLine1 && (
                            <p className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                              {order.shipping.addressLine1}, {order.shipping.city}, {order.shipping.state}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span
                                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  it.format === 'digital' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {it.format}
                              </span>
                              <span className="font-medium text-slate-800 truncate max-w-xs">
                                {it.book.title} (x{it.quantity})
                              </span>
                            </div>
                          ))}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-slate-900 text-sm">₹{order.total}</p>
                          {order.discount > 0 && (
                            <p className="text-[10px] text-emerald-600 font-semibold">
                              Saved ₹{order.discount}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="uppercase text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                            {order.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: ADD / EDIT PRODUCT
          ========================================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0a2540] text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                  {editingBookId ? 'Edit Product & Content' : 'Add New Book to Catalog'}
                </h3>
                <p className="text-xs text-slate-300">
                  Configure titles, dual pricing, cover themes, sample PDFs, and external links
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBook} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* SECTION 1: PRODUCT IMAGES (UP TO 4 IMAGES • CLOUDINARY LIVE SYNC) */}
              <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a2540] to-slate-950 text-white border border-slate-700/60 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white flex items-center gap-2">
                        <span>1. Product Images Gallery (Up to 4 Images)</span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                          Cloudinary CDN
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        Slot 1 serves as the primary storefront cover. All 4 uploaded images sync live to visitors in real-time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                      Live Real-Time Sync
                    </span>
                  </div>
                </div>

                {/* SKU Config for Cloudinary Naming */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Product SKU / Public ID Prefix:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PROD-1029"
                      value={productSkuInput}
                      onChange={(e) => setProductSkuInput(e.target.value)}
                      className="px-2.5 py-1 text-xs rounded-lg border border-slate-600 bg-slate-900 text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-400 w-44"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Images are saved on Cloudinary under this SKU
                  </span>
                </div>

                {/* Hidden File Input for Targeting Any Slot */}
                <input
                  type="file"
                  ref={slotFileInputRef}
                  accept="image/*"
                  disabled={isUploadingImage}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadSlotImage(f, targetSlotToUpload);
                  }}
                  className="hidden"
                />

                {/* Upload Status Alert */}
                {uploadStatus.message && (
                  <div
                    className={`text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-2 ${
                      uploadStatus.type === 'uploading'
                        ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                        : uploadStatus.type === 'success'
                        ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50'
                        : 'bg-rose-900/40 text-rose-300 border border-rose-700/50'
                    }`}
                  >
                    {uploadStatus.type === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-blue-400 shrink-0" />}
                    {uploadStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {uploadStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span>{uploadStatus.message}</span>
                  </div>
                )}

                {/* 4-Slot Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[0, 1, 2, 3].map((slotIdx) => {
                    const currentImg =
                      (bookFormData.images && bookFormData.images[slotIdx]) ||
                      (slotIdx === 0 ? bookFormData.imageUrl : '');
                    const isUploadingThisSlot = isUploadingImage && activeSlotUploading === slotIdx;
                    const slotTitles = [
                      'Slot 1 (Cover / Main)',
                      'Slot 2 (TOC / Preview)',
                      'Slot 3 (Mock Test)',
                      'Slot 4 (Back / Details)',
                    ];

                    return (
                      <div
                        key={slotIdx}
                        className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                          currentImg
                            ? 'bg-slate-950/70 border-slate-700'
                            : 'bg-slate-900/50 border-dashed border-slate-700/80 hover:border-sky-500/50'
                        }`}
                      >
                        {/* Slot Header */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              slotIdx === 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {slotTitles[slotIdx]}
                          </span>

                          {currentImg && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSlotImage(slotIdx)}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                              title="Remove image from this slot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Image Preview or Empty State Dropzone */}
                        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center min-h-[140px] my-1 group">
                          {isUploadingThisSlot ? (
                            <div className="flex flex-col items-center justify-center p-3 text-center">
                              <Loader2 className="w-6 h-6 animate-spin text-sky-400 mb-1.5" />
                              <p className="text-[11px] font-bold text-sky-300">Uploading...</p>
                              <p className="text-[9px] text-slate-400">Syncing live CDN</p>
                            </div>
                          ) : currentImg ? (
                            <div className="relative w-full h-[140px] flex items-center justify-center">
                              <img
                                src={currentImg}
                                alt={`Slot ${slotIdx + 1} Preview`}
                                className="w-full h-full object-contain bg-slate-950/80"
                              />
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTargetSlotToUpload(slotIdx);
                                    slotFileInputRef.current?.click();
                                  }}
                                  className="w-full py-1 px-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-[10px] font-bold text-white shadow-xs"
                                >
                                  Replace Image
                                </button>
                                {slotIdx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetSlotAsCover(slotIdx)}
                                    className="w-full py-1 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-[10px] font-bold text-white shadow-xs"
                                    title="Make this image the main product cover"
                                  >
                                    ★ Make Cover
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              onClick={() => {
                                setTargetSlotToUpload(slotIdx);
                                slotFileInputRef.current?.click();
                              }}
                              className="flex flex-col items-center justify-center p-3 text-center cursor-pointer w-full h-full hover:bg-sky-950/20 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-sky-500/20 text-slate-400 group-hover:text-sky-400 flex items-center justify-center transition-colors mb-1">
                                <Upload className="w-4 h-4" />
                              </div>
                              <p className="text-[11px] font-bold text-slate-300 group-hover:text-white">
                                + Upload Image
                              </p>
                              <p className="text-[9px] text-slate-500">PNG, JPG, WebP</p>
                            </div>
                          )}
                        </div>

                        {/* Slot Footer Controls (URL Input / Actions) */}
                        <div className="mt-2 space-y-1.5">
                          <input
                            type="url"
                            placeholder="Paste direct image URL..."
                            value={currentImg || ''}
                            onChange={(e) => handleSetSlotImageUrl(slotIdx, e.target.value)}
                            className="w-full px-2 py-1 text-[10px] rounded-lg border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-400 truncate"
                          />

                          <div className="flex items-center justify-between gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setTargetSlotToUpload(slotIdx);
                                slotFileInputRef.current?.click();
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[9px] font-bold text-slate-300 transition-colors text-center"
                            >
                              {currentImg ? 'Change File' : 'Browse File'}
                            </button>

                            {currentImg && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(currentImg);
                                  showToast(`Copied Slot ${slotIdx + 1} URL!`, 'info');
                                }}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Copy image URL"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}

                            {currentImg && (
                              <a
                                href={currentImg}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                                title="Open full-res image"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Basic Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                  2. Book Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Book Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IELTS Academic 2026 Complete Prep Masterclass"
                      value={bookFormData.title}
                      onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Subtitle / Edition</label>
                    <input
                      type="text"
                      placeholder="e.g. Band 8.0+ Target Guide with 8 Mock Tests"
                      value={bookFormData.subtitle}
                      onChange={(e) => setBookFormData({ ...bookFormData, subtitle: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Category *</label>
                    <select
                      value={bookFormData.category}
                      onChange={(e) =>
                        setBookFormData({ ...bookFormData, category: e.target.value as ExamCategory })
                      }
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                    >
                      <option value="IELTS">IELTS</option>
                      <option value="OET">OET</option>
                      <option value="PTE">PTE</option>
                      <option value="German">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">Material Type</label>
                    <select
                      value={bookFormData.type}
                      onChange={(e) =>
                        setBookFormData({ ...bookFormData, type: e.target.value as any })
                      }
                      className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                    >
                      <option value="Study Guides">Study Guides</option>
                      <option value="Practice Books">Practice Books</option>
                      <option value="Mock Tests">Mock Tests</option>
                      <option value="Vocabulary & Grammar">Vocabulary & Grammar</option>
                      <option value="Bundle Packs">Bundle Packs</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookFormData.isBestSeller}
                        onChange={(e) =>
                          setBookFormData({ ...bookFormData, isBestSeller: e.target.checked })
                        }
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Mark as Best Seller</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bookFormData.isNew}
                        onChange={(e) => setBookFormData({ ...bookFormData, isNew: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>New 2026 Edition</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                  2. Pricing & Formats
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Digital Pricing */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                    <h5 className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <DownloadCloud className="w-4 h-4 text-blue-600" />
                      Digital (PDF) Pricing
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">Sale Price (₹)</label>
                        <input
                          type="number"
                          value={bookFormData.prices.digital.price}
                          onChange={(e) => {
                            const p = Number(e.target.value);
                            const orig = bookFormData.prices.digital.originalPrice || p;
                            const disc = Math.round(((orig - p) / orig) * 100);
                            setBookFormData({
                              ...bookFormData,
                              prices: {
                                ...bookFormData.prices,
                                digital: { price: p, originalPrice: orig, discountPercent: disc },
                              },
                            });
                          }}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">Original (₹)</label>
                        <input
                          type="number"
                          value={bookFormData.prices.digital.originalPrice}
                          onChange={(e) => {
                            const orig = Number(e.target.value);
                            const p = bookFormData.prices.digital.price;
                            const disc = Math.round(((orig - p) / orig) * 100);
                            setBookFormData({
                              ...bookFormData,
                              prices: {
                                ...bookFormData.prices,
                                digital: { price: p, originalPrice: orig, discountPercent: disc },
                              },
                            });
                          }}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Physical Pricing */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3">
                    <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      Physical (Printed) Pricing
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">Sale Price (₹)</label>
                        <input
                          type="number"
                          value={bookFormData.prices.physical.price}
                          onChange={(e) => {
                            const p = Number(e.target.value);
                            const orig = bookFormData.prices.physical.originalPrice || p;
                            const disc = Math.round(((orig - p) / orig) * 100);
                            setBookFormData({
                              ...bookFormData,
                              prices: {
                                ...bookFormData.prices,
                                physical: { price: p, originalPrice: orig, discountPercent: disc },
                              },
                            });
                          }}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600">Original (₹)</label>
                        <input
                          type="number"
                          value={bookFormData.prices.physical.originalPrice}
                          onChange={(e) => {
                            const orig = Number(e.target.value);
                            const p = bookFormData.prices.physical.price;
                            const disc = Math.round(((orig - p) / orig) * 100);
                            setBookFormData({
                              ...bookFormData,
                              prices: {
                                ...bookFormData.prices,
                                physical: { price: p, originalPrice: orig, discountPercent: disc },
                              },
                            });
                          }}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Gradients & 3D Visualizer */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    4. Cover Gradients & 3D Visualizer
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Theme / Fallback
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Cover Gradient Theme (Fallback)</label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {gradientPresets.map((preset) => (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() =>
                              setBookFormData({
                                ...bookFormData,
                                coverTheme: {
                                  ...bookFormData.coverTheme,
                                  bgGradient: preset.value,
                                  accentColor: preset.accent,
                                },
                              })
                            }
                            className={`p-2 rounded-lg text-[10px] font-bold text-center border transition-all ${
                              bookFormData.coverTheme.bgGradient === preset.value
                                ? 'border-emerald-600 ring-2 ring-emerald-200 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div
                              className={`w-full h-3 rounded-xs mb-1 bg-gradient-to-r ${preset.value}`}
                            />
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700">Badge Text</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026 EDITION"
                        value={bookFormData.coverTheme.badgeText}
                        onChange={(e) =>
                          setBookFormData({
                            ...bookFormData,
                            coverTheme: { ...bookFormData.coverTheme, badgeText: e.target.value },
                          })
                        }
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Cover Live Preview */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-[11px] font-bold text-slate-400 mb-2">3D Book Live Preview</p>
                    <BookCover
                      book={{
                        ...bookFormData,
                        id: 'preview',
                      } as Book}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

              {/* Ad Links for Books */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                  4. External Ad / Affiliate / Partner Links
                </h4>
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Ad / Purchase Link (URL)</label>
                      <input
                        type="url"
                        placeholder="https://amazon.in/dp/example-asin or partner link"
                        value={bookFormData.adLink}
                        onChange={(e) => setBookFormData({ ...bookFormData, adLink: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Button / Callout Text</label>
                      <input
                        type="text"
                        placeholder="e.g. Also Available on Amazon India (Prime)"
                        value={bookFormData.adText}
                        onChange={(e) => setBookFormData({ ...bookFormData, adText: e.target.value })}
                        className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    💡 If provided, this link appears prominently as an alternate buying route or partner offer on the product detail page.
                  </p>
                </div>
              </div>

              {/* Description & Features */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-1">
                  5. Descriptions & Highlights
                </h4>
                <div>
                  <label className="text-xs font-bold text-slate-700">Short Summary Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview for catalog cards..."
                    value={bookFormData.description}
                    onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700">Full Academic Description</label>
                  <textarea
                    rows={4}
                    placeholder="Comprehensive explanation of curriculum, modules, strategy, and test tips..."
                    value={bookFormData.longDescription}
                    onChange={(e) => setBookFormData({ ...bookFormData, longDescription: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50"
                  />
                </div>

                {/* Features List */}
                <div>
                  <label className="text-xs font-bold text-slate-700">Key Highlights / Features</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Add highlight (e.g. 500+ Practice Questions)"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (featureInput.trim()) {
                          setBookFormData({
                            ...bookFormData,
                            features: [...bookFormData.features, featureInput.trim()],
                          });
                          setFeatureInput('');
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {bookFormData.features.map((feat, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5"
                      >
                        {feat}
                        <button
                          type="button"
                          onClick={() =>
                            setBookFormData({
                              ...bookFormData,
                              features: bookFormData.features.filter((_, idx) => idx !== i),
                            })
                          }
                          className="text-emerald-700 hover:text-emerald-950 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00875a] hover:bg-[#00734c] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingBookId ? 'Save Changes' : 'Publish Book to Store'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONFIRM DELETE MODAL
          ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Confirm Deletion
              </h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this {deleteType === 'book' ? 'book' : 'testimonial'}? This action will remove it from the catalog immediately.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteType === 'book') {
                    deleteBook(deleteConfirmId);
                  } else if (deleteType === 'testimonial') {
                    deleteTestimonial(deleteConfirmId);
                  }
                  setDeleteConfirmId(null);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
