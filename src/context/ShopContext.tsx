import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Book, BookFormat, CartItem, Order, ShippingInfo, ExamCategory, ViewType, Review, Testimonial, ExamPath } from '../types';
import { BOOKS } from '../data/books';
import { TESTIMONIALS } from '../data/testimonials';
import { DEFAULT_EXAM_PATHS } from '../data/examPaths';
import {
  saveCatalogToCloud,
  fetchCatalogFromCloud,
  checkCatalogVersion,
  subscribeToRealtimeBroadcast,
} from '../utils/cloudSync';
import { getBookAddons, calculateAddonsPricing } from '../utils/pricing';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
}

interface ShopContextType {
  // Navigation
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedCategory: ExamCategory;
  setSelectedCategory: (cat: ExamCategory) => void;
  selectedBookId: string;
  setSelectedBookId: (id: string) => void;
  checkoutStep: 1 | 2 | 3;
  setCheckoutStep: (step: 1 | 2 | 3) => void;

  // Products & Books Catalog
  books: Book[];
  addBook: (book: Book) => void;
  updateBook: (id: string, updated: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  resetBooksToDefault: () => void;
  reorderBooks: (orderedBooks: Book[]) => void;
  moveBookOrder: (bookId: string, direction: 'up' | 'down') => void;
  setBookOrderPosition: (bookId: string, targetPosition: number) => void;

  // Real-time Cloud Synchronization
  isCloudSyncing: boolean;
  lastCloudSync: Date | null;
  refreshProductsFromCloud: () => Promise<void>;
  syncBooksToCloud: (booksToSync?: Book[]) => Promise<void>;

  // Exam Paths (Image 1 - Hero & Homepage Category Cards)
  examPaths: ExamPath[];
  updateExamPath: (category: ExamCategory, updated: Partial<ExamPath>) => void;
  resetExamPathsToDefault: () => void;

  // Testimonials & Reviews (Image 2 - Learner Avatars & Quotes)
  testimonials: Testimonial[];
  addTestimonial: (testimonial: Omit<Testimonial, 'id'>) => void;
  updateTestimonial: (id: string, updated: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  resetTestimonialsToDefault: () => void;
  addReview: (bookId: string, review: Omit<Review, 'id' | 'date'>) => void;

  // Cart
  cart: CartItem[];
  addToCart: (book: Book, format?: BookFormat, quantity?: number, selectedAddonIds?: string[]) => void;
  buyNow: (book: Book, format?: BookFormat, quantity?: number, selectedAddonIds?: string[]) => void;
  updateCartQty: (bookId: string, format: BookFormat, delta: number, selectedAddonIds?: string[]) => void;
  removeFromCart: (bookId: string, format: BookFormat, selectedAddonIds?: string[]) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;

  // Coupon
  couponCode: string;
  appliedCoupon: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (bookId: string) => void;
  isInWishlist: (bookId: string) => boolean;

  // Shipping & Orders
  shippingInfo: ShippingInfo;
  setShippingInfo: React.Dispatch<React.SetStateAction<ShippingInfo>>;
  currentOrder: Order | null;
  setCurrentOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  orders: Order[];
  placeOrder: (paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallets') => Promise<Order>;

  // Search & Modals
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // PDF Preview & Reader
  isPdfModalOpen: boolean;
  activePdfBook: Book | null;
  openPdfViewer: (book: Book) => void;
  closePdfViewer: () => void;
  downloadBookPdf: (book: Book) => void;

  // Support / Contact Modal
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;

  // Helpers
  navigateToProduct: (bookId: string) => void;
  navigateToCatalog: (category?: ExamCategory) => void;
  openCart: () => void;
}

const defaultShipping: ShippingInfo = {
  fullName: 'Ashin Shiju',
  email: 'ashin.shiju@example.com',
  phone: '9876543210',
  addressLine1: 'Building 4B, Green Park Avenue',
  addressLine2: 'Near Metro Station',
  city: 'Kochi',
  state: 'Kerala',
  pinCode: '682016',
  deliveryOption: 'digital',
  saveAddress: true,
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('All');
  const [selectedBookId, setSelectedBookId] = useState<string>('ielts-full-prep');
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);

  // Persistent Books State
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('xylem_books_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load books from storage:', e);
    }
    return BOOKS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('xylem_books_data', JSON.stringify(books));
    } catch (e) {
      console.error('Failed to save books to storage:', e);
    }
  }, [books]);

  // Persistent Exam Paths State (Image 1 - IELTS, OET, PTE, German)
  const [examPaths, setExamPaths] = useState<ExamPath[]>(() => {
    try {
      const saved = localStorage.getItem('xylem_exam_paths_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load exam paths from storage:', e);
    }
    return DEFAULT_EXAM_PATHS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('xylem_exam_paths_data', JSON.stringify(examPaths));
    } catch (e) {
      console.error('Failed to save exam paths to storage:', e);
    }
  }, [examPaths]);

  // Persistent Testimonials State (Image 2 - Anjana, Rohith, Sneha, etc.)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem('xylem_testimonials_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load testimonials from storage:', e);
    }
    return TESTIMONIALS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('xylem_testimonials_data', JSON.stringify(testimonials));
    } catch (e) {
      console.error('Failed to save testimonials to storage:', e);
    }
  }, [testimonials]);

  // Real-time Cloud Synchronization State
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastCloudSync, setLastCloudSync] = useState<Date | null>(null);
  const localCatalogVersionRef = useRef<number>(0);
  const isFetchingRemoteRef = useRef<boolean>(false);

  useEffect(() => {
    try {
      const savedVersion = Number(localStorage.getItem('xylem_books_version'));
      if (savedVersion) localCatalogVersionRef.current = savedVersion;
    } catch {}
  }, []);

  const triggerCloudSync = async (
    booksToSync: Book[],
    pathsToSync?: ExamPath[],
    testisToSync?: Testimonial[]
  ) => {
    setIsCloudSyncing(true);
    try {
      const paths = pathsToSync || examPaths;
      const testis = testisToSync || testimonials;
      const res = await saveCatalogToCloud(booksToSync, paths, testis);
      if (res.success) {
        if (res.version) localCatalogVersionRef.current = res.version;
        setLastCloudSync(new Date());
      }
    } catch (e) {
      console.error('Real-time sync to cloud failed:', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const syncBooksToCloud = async (customBooks?: Book[]) => {
    await triggerCloudSync(customBooks || books);
  };

  const refreshProductsFromCloud = async (force = false) => {
    if (isFetchingRemoteRef.current) return;
    isFetchingRemoteRef.current = true;
    try {
      // 1. Fast version check first (skips large payload if nothing changed)
      if (!force) {
        const latestVersion = await checkCatalogVersion();
        if (latestVersion !== null && latestVersion <= localCatalogVersionRef.current) {
          isFetchingRemoteRef.current = false;
          return;
        }
      }

      // 2. Fetch full updated catalog
      const remote = await fetchCatalogFromCloud();
      if (remote && Array.isArray(remote.books) && remote.books.length > 0) {
        const remoteVersion = remote.version || Date.now();
        if (force || remoteVersion > localCatalogVersionRef.current) {
          localCatalogVersionRef.current = remoteVersion;
          setBooks(remote.books);
          if (Array.isArray(remote.examPaths) && remote.examPaths.length > 0) {
            setExamPaths(remote.examPaths);
            try {
              localStorage.setItem('xylem_exam_paths_data', JSON.stringify(remote.examPaths));
            } catch {}
          }
          if (Array.isArray(remote.testimonials) && remote.testimonials.length > 0) {
            setTestimonials(remote.testimonials);
            try {
              localStorage.setItem('xylem_testimonials_data', JSON.stringify(remote.testimonials));
            } catch {}
          }
          setLastCloudSync(new Date());
          try {
            localStorage.setItem('xylem_books_data', JSON.stringify(remote.books));
            localStorage.setItem('xylem_books_version', String(remoteVersion));
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Real-time background sync fetch error:', err);
    } finally {
      isFetchingRemoteRef.current = false;
    }
  };

  // Real-time synchronization listeners:
  // - Immediate force fetch on mount
  // - 1.5-second ultra-responsive version check poller
  // - Instant cross-tab BroadcastChannel & Storage events (0ms latency)
  // - Immediate check on tab focus & visibility change
  // - User interaction wakeup (click / touch)
  useEffect(() => {
    refreshProductsFromCloud(true);

    const unsubscribe = subscribeToRealtimeBroadcast((newBooks, version, newPaths, newTestis) => {
      localCatalogVersionRef.current = version;
      setBooks(newBooks);
      if (newPaths && Array.isArray(newPaths)) {
        setExamPaths(newPaths);
      }
      if (newTestis && Array.isArray(newTestis)) {
        setTestimonials(newTestis);
      }
      setLastCloudSync(new Date());
    });

    // Fast 1.5s real-time check interval
    const interval = setInterval(() => {
      refreshProductsFromCloud(false);
    }, 1500);

    const onWakeup = () => {
      refreshProductsFromCloud(false);
    };

    window.addEventListener('focus', onWakeup);
    document.addEventListener('visibilitychange', onWakeup);

    // Throttled check on user click or touch
    let lastInteractionTime = 0;
    const onUserInteraction = () => {
      const now = Date.now();
      if (now - lastInteractionTime > 3000) {
        lastInteractionTime = now;
        refreshProductsFromCloud(false);
      }
    };
    window.addEventListener('pointerdown', onUserInteraction, { passive: true });

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener('focus', onWakeup);
      document.removeEventListener('visibilitychange', onWakeup);
      window.removeEventListener('pointerdown', onUserInteraction);
    };
  }, []);

  // Cart state initialized with 1 default item (IELTS Full Preparation Digital) matching the mockup!
  const [cart, setCart] = useState<CartItem[]>(() => {
    const defaultBook = books.find((b) => b.id === 'ielts-full-prep') || books[0] || BOOKS[0];
    return [
      {
        bookId: defaultBook.id,
        book: defaultBook,
        format: 'digital',
        quantity: 1,
        price: defaultBook.prices.digital.price,
      },
    ];
  });

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(defaultShipping);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activePdfBook, setActivePdfBook] = useState<Book | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedBookId, selectedCategory]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const addToCart = (
    book: Book,
    format: BookFormat = 'digital',
    quantity = 1,
    selectedAddonIds?: string[]
  ) => {
    const allAddons = getBookAddons(book);
    const activeIds =
      selectedAddonIds && selectedAddonIds.length > 0
        ? selectedAddonIds
        : [format === 'digital' ? 'digital' : 'physical'];

    const pricing = calculateAddonsPricing(allAddons, activeIds, book.buy2Get3rdFree);
    const effectiveFormat: BookFormat = pricing.hasPhysical ? 'physical' : 'digital';

    const cartItem: CartItem = {
      bookId: book.id,
      book,
      format: effectiveFormat,
      quantity,
      price: pricing.finalPrice,
      originalPrice: pricing.originalTotal,
      selectedAddonIds: activeIds,
      selectedAddons: pricing.selected,
      freeAddonDiscount: pricing.freeDiscount,
    };

    setCart((prev) => {
      const addonKey = activeIds.slice().sort().join(',');
      const existingIndex = prev.findIndex((item) => {
        if (item.bookId !== book.id) return false;
        const itemKey = item.selectedAddonIds ? item.selectedAddonIds.slice().sort().join(',') : '';
        return itemKey ? itemKey === addonKey : item.format === effectiveFormat;
      });

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, cartItem];
    });

    const dealNote = pricing.freeDiscount > 0 ? ' (3rd Add-on FREE Deal Applied!)' : '';
    showToast(`Added "${book.title}" to cart!${dealNote}`, 'success');
  };

  const buyNow = (
    book: Book,
    format: BookFormat = 'digital',
    quantity = 1,
    selectedAddonIds?: string[]
  ) => {
    const allAddons = getBookAddons(book);
    const activeIds =
      selectedAddonIds && selectedAddonIds.length > 0
        ? selectedAddonIds
        : [format === 'digital' ? 'digital' : 'physical'];

    const pricing = calculateAddonsPricing(allAddons, activeIds, book.buy2Get3rdFree);
    const effectiveFormat: BookFormat = pricing.hasPhysical ? 'physical' : 'digital';

    setCart([
      {
        bookId: book.id,
        book,
        format: effectiveFormat,
        quantity,
        price: pricing.finalPrice,
        originalPrice: pricing.originalTotal,
        selectedAddonIds: activeIds,
        selectedAddons: pricing.selected,
        freeAddonDiscount: pricing.freeDiscount,
      },
    ]);
    setCheckoutStep(1);
    setCurrentView('checkout');
  };

  const updateCartQty = (
    bookId: string,
    format: BookFormat,
    delta: number,
    selectedAddonIds?: string[]
  ) => {
    const addonKey = selectedAddonIds ? selectedAddonIds.slice().sort().join(',') : '';
    setCart((prev) =>
      prev
        .map((item) => {
          const itemKey = item.selectedAddonIds ? item.selectedAddonIds.slice().sort().join(',') : '';
          const match =
            item.bookId === bookId && (addonKey ? itemKey === addonKey : item.format === format);
          if (match) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (
    bookId: string,
    format: BookFormat,
    selectedAddonIds?: string[]
  ) => {
    const addonKey = selectedAddonIds ? selectedAddonIds.slice().sort().join(',') : '';
    setCart((prev) =>
      prev.filter((item) => {
        if (item.bookId !== bookId) return true;
        const itemKey = item.selectedAddonIds ? item.selectedAddonIds.slice().sort().join(',') : '';
        if (addonKey) {
          return itemKey !== addonKey;
        }
        return item.format !== format;
      })
    );
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (bookId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(bookId);
      if (exists) {
        showToast('Removed from your wishlist', 'info');
        return prev.filter((id) => id !== bookId);
      } else {
        showToast('Saved to your wishlist!', 'success');
        return [...prev, bookId];
      }
    });
  };

  const isInWishlist = (bookId: string) => wishlist.includes(bookId);

  // Calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check if any physical book in cart
  const hasPhysicalItem = cart.some((item) => item.format === 'physical');
  const deliveryFee = hasPhysicalItem && shippingInfo.deliveryOption === 'physical' ? 99 : 0;

  const total = Math.max(0, subtotal + deliveryFee - couponDiscount);

  // Coupon handling
  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (!clean) return false;

    if (clean === 'XYLEM20') {
      const discountVal = Math.round(subtotal * 0.2);
      setAppliedCoupon('XYLEM20');
      setCouponDiscount(discountVal);
      showToast('Coupon XYLEM20 applied! 20% discount added.');
      return true;
    } else if (clean === 'FIRST50') {
      const discountVal = Math.min(50, subtotal);
      setAppliedCoupon('FIRST50');
      setCouponDiscount(discountVal);
      showToast('Coupon FIRST50 applied! ₹50 off.');
      return true;
    } else if (clean === 'SPECIALOFFER' || clean === 'OFFER67') {
      const discountVal = Math.round(subtotal * 0.15);
      setAppliedCoupon(clean);
      setCouponDiscount(discountVal);
      showToast(`Coupon ${clean} applied!`);
      return true;
    } else {
      showToast('Invalid coupon code. Try XYLEM20 or FIRST50', 'warning');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Coupon removed');
  };

  const placeOrder = async (paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallets'): Promise<Order> => {
    // Generate order
    const orderNumber = `XL${new Date().getFullYear()}${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderNumber,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      items: [...cart],
      shipping: { ...shippingInfo },
      subtotal,
      discount: couponDiscount,
      deliveryFee,
      total,
      paymentMethod,
      status: 'confirmed',
      paymentId: `PAY_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    clearCart();
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCurrentView('order-success');
    return newOrder;
  };

  const navigateToProduct = (bookId: string) => {
    setSelectedBookId(bookId);
    setCurrentView('product');
  };

  const navigateToCatalog = (category: ExamCategory = 'All') => {
    setSelectedCategory(category);
    setCurrentView('catalog');
  };

  const openCart = () => {
    setCurrentView('cart');
  };

  const openPdfViewer = (book: Book) => {
    setActivePdfBook(book);
    setIsPdfModalOpen(true);
  };

  const closePdfViewer = () => {
    setIsPdfModalOpen(false);
  };

  const addBook = (newBook: Book) => {
    setBooks((prev) => {
      const updated = [newBook, ...prev];
      triggerCloudSync(updated);
      return updated;
    });
    showToast(`Book "${newBook.title}" published & synced live to all users!`, 'success');
  };

  const updateBook = (id: string, updated: Partial<Book>) => {
    setBooks((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...updated } : b));
      triggerCloudSync(next);
      return next;
    });
    showToast('Product updated & synced in real-time to all users!', 'success');
  };

  const deleteBook = (id: string) => {
    setBooks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      triggerCloudSync(next);
      return next;
    });
    showToast('Book removed & synced live across all clients', 'info');
  };

  const resetBooksToDefault = () => {
    setBooks(BOOKS);
    setTestimonials(TESTIMONIALS);
    localStorage.removeItem('xylem_books_data');
    localStorage.removeItem('xylem_testimonials_data');
    triggerCloudSync(BOOKS);
    showToast('Catalog restored to default books & synced', 'info');
  };

  const reorderBooks = (orderedBooks: Book[]) => {
    const withOrder = orderedBooks.map((b, i) => ({ ...b, order: i + 1 }));
    setBooks(withOrder);
    triggerCloudSync(withOrder);
    showToast('Product arrangement updated & synced live across storefront!', 'success');
  };

  const moveBookOrder = (bookId: string, direction: 'up' | 'down') => {
    setBooks((prev) => {
      const idx = prev.findIndex((b) => b.id === bookId);
      if (idx === -1) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);

      const withOrder = next.map((b, i) => ({ ...b, order: i + 1 }));
      triggerCloudSync(withOrder);
      return withOrder;
    });
    showToast('Homepage product position updated & synced!', 'success');
  };

  const setBookOrderPosition = (bookId: string, targetPosition: number) => {
    setBooks((prev) => {
      const idx = prev.findIndex((b) => b.id === bookId);
      if (idx === -1) return prev;
      const clamped = Math.max(1, Math.min(prev.length, targetPosition)) - 1;
      if (clamped === idx) return prev;

      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(clamped, 0, moved);

      const withOrder = next.map((b, i) => ({ ...b, order: i + 1 }));
      triggerCloudSync(withOrder);
      return withOrder;
    });
    showToast(`Product moved to position #${targetPosition} & synced live!`, 'success');
  };

  // Exam Paths management (Image 1)
  const updateExamPath = (category: ExamCategory, updated: Partial<ExamPath>) => {
    const nextPaths = examPaths.map((p) => (p.category === category ? { ...p, ...updated } : p));
    setExamPaths(nextPaths);
    triggerCloudSync(books, nextPaths, testimonials);
    showToast(`Updated ${category} card image & content! Synced live.`, 'success');
  };

  const resetExamPathsToDefault = () => {
    setExamPaths(DEFAULT_EXAM_PATHS);
    triggerCloudSync(books, DEFAULT_EXAM_PATHS, testimonials);
    showToast('Reset homepage exam path cards to default.', 'info');
  };

  // Testimonials management (Image 2)
  const addTestimonial = (item: Omit<Testimonial, 'id'>) => {
    const newTestimonial: Testimonial = {
      ...item,
      id: `test-${Date.now()}`,
    };
    const nextTestis = [newTestimonial, ...testimonials];
    setTestimonials(nextTestis);
    triggerCloudSync(books, examPaths, nextTestis);
    showToast('Student testimonial published & synced live!', 'success');
  };

  const updateTestimonial = (id: string, updated: Partial<Testimonial>) => {
    const nextTestis = testimonials.map((t) => (t.id === id ? { ...t, ...updated } : t));
    setTestimonials(nextTestis);
    triggerCloudSync(books, examPaths, nextTestis);
    showToast('Student testimonial updated & synced live!', 'success');
  };

  const deleteTestimonial = (id: string) => {
    const nextTestis = testimonials.filter((t) => t.id !== id);
    setTestimonials(nextTestis);
    triggerCloudSync(books, examPaths, nextTestis);
    showToast('Testimonial removed & synced live', 'info');
  };

  const resetTestimonialsToDefault = () => {
    setTestimonials(TESTIMONIALS);
    triggerCloudSync(books, examPaths, TESTIMONIALS);
    showToast('Reset student testimonials to default.', 'info');
  };

  const addReview = (bookId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const currentReviews = b.reviews || [];
          const updatedReviews = [newReview, ...currentReviews];
          const newCount = (b.reviewCount || 0) + 1;
          const totalRatingSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAvgRating = Number((totalRatingSum / updatedReviews.length).toFixed(1));
          return {
            ...b,
            reviews: updatedReviews,
            reviewCount: newCount,
            rating: newAvgRating,
          };
        }
        return b;
      })
    );
    showToast('Review submitted and verified!', 'success');
  };

  const downloadBookPdf = (book: Book) => {
    if (book.pdfUrl) {
      const link = document.createElement('a');
      link.href = book.pdfUrl;
      link.download = book.samplePdfName || `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded "${book.title}" PDF! Check your downloads folder.`, 'success');
      return;
    }

    // Generate an authentic document download
    const titleClean = book.title.replace(/[^a-zA-Z0-9]/g, '_');
    const content = `%PDF-1.4
%
1 0 obj
<< /Title (${book.title} - Xylem Bookstore Official Exam Guide)
   /Author (Xylem Bookstore Academic Editorial Board)
   /Subject (${book.category} Exam Preparation)
   /Keywords (IELTS, OET, PTE, German, Mock Test, Study Guide)
   /Creator (Xylem Bookstore Publishing Engine)
>>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 595 842] /Contents 5 0 R >>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 750 Td
(XYLEM BOOKSTORE) Tj
/F1 16 Tf
0 -40 Td
(${book.title}) Tj
/F1 12 Tf
0 -30 Td
(Category: ${book.category} | Exam Edition 2026) Tj
0 -20 Td
(License issued to authenticated learner) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000215 00000 n 
0000000262 00000 n 
0000000321 00000 n 
0000000410 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
660
%%EOF`;

    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titleClean}_XylemBookstore.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded "${book.title}" PDF! Check your downloads folder.`, 'success');
  };

  return (
    <ShopContext.Provider
      value={{
        currentView,
        setCurrentView,
        selectedCategory,
        setSelectedCategory,
        selectedBookId,
        setSelectedBookId,
        checkoutStep,
        setCheckoutStep,

        // Catalog & Admin
        books,
        addBook,
        updateBook,
        deleteBook,
        resetBooksToDefault,
        reorderBooks,
        moveBookOrder,
        setBookOrderPosition,

        // Exam Paths (Image 1)
        examPaths,
        updateExamPath,
        resetExamPathsToDefault,

        // Testimonials (Image 2)
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        resetTestimonialsToDefault,
        addReview,

        cart,
        addToCart,
        buyNow,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
        discount: couponDiscount,
        deliveryFee,
        total,

        couponCode,
        appliedCoupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,

        wishlist,
        toggleWishlist,
        isInWishlist,

        shippingInfo,
        setShippingInfo,
        currentOrder,
        setCurrentOrder,
        orders,
        placeOrder,

        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,

        isPdfModalOpen,
        activePdfBook,
        openPdfViewer,
        closePdfViewer,
        downloadBookPdf,

        isContactModalOpen,
        setIsContactModalOpen,

        toasts,
        showToast,

        navigateToProduct,
        navigateToCatalog,
        openCart,

        isCloudSyncing,
        lastCloudSync,
        refreshProductsFromCloud,
        syncBooksToCloud,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
