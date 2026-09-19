export type ExamCategory = 'IELTS' | 'OET' | 'PTE' | 'German' | 'All';

export type BookFormat = 'digital' | 'physical';

export type ViewType = 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'order-success' | 'orders' | 'about' | 'admin';

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  category: ExamCategory;
  type: 'Study Guides' | 'Practice Books' | 'Mock Tests' | 'Vocabulary & Grammar' | 'Bundle Packs';
  isBestSeller?: boolean;
  isNew?: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  longDescription: string;
  features: string[];
  whatYouGet: string[];
  tableOfContents: { chapter: string; pages: string }[];
  prices: {
    digital: {
      price: number;
      originalPrice: number;
      discountPercent: number;
    };
    physical: {
      price: number;
      originalPrice: number;
      discountPercent: number;
    };
  };
  coverTheme: {
    bgGradient: string;
    accentColor: string;
    textColor: string;
    badgeText: string;
  };
  samplePdfName: string;
  pdfUrl?: string;
  imageUrl?: string;
  coverImage?: string;
  images?: string[];
  order?: number;
  adLink?: string;
  adText?: string;
  reviews?: Review[];
  totalPages?: number;
}

export interface CartItem {
  bookId: string;
  book: Book;
  format: BookFormat;
  quantity: number;
  price: number;
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pinCode: string;
  deliveryOption: 'digital' | 'physical';
  saveAddress: boolean;
}

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallets';

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  shipping: ShippingInfo;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'confirmed' | 'dispatched' | 'delivered';
  paymentId: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  bandOrScore?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}
