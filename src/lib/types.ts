// =============================================================================
// Andromeda — Shared TypeScript Types
// Matches API response shapes from docs/architecture/05-api-specification.md
// =============================================================================

// --- Pagination ---

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// --- Category ---

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  productCount: number;
}

// --- Seller ---

export interface SellerBrief {
  id: string;
  businessName: string;
  slug: string;
  isVerified: boolean;
}

export interface SellerListing {
  sellerId: string;
  sellerName: string;
  isVerified: boolean;
  price: number;
  stock: number;
  deliveryDays: number;
  rating: number;
  shopUrl: string;
}

// --- Product ---

export interface ProductCard {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  price: number;
  originalPrice: number | null;
  discountPct: number;
  currency: string;
  stock: number;
  rating: number;
  reviewCount: number;
  brand: string | null;
  isFeatured: boolean;
  seller: SellerBrief;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface PriceHistoryPoint {
  price: number;
  currency: string;
  recordedAt: string;
}

export interface ReviewSummary {
  average: number;
  total: number;
  breakdown: Record<string, number>;
}

export interface ProductDetail extends ProductCard {
  description: string;
  shortDesc: string | null;
  images: string[];
  specs: Record<string, string>;
  tags: string[];
  sku: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  priceHistory: PriceHistoryPoint[];
  reviewSummary: ReviewSummary;
  sellers: SellerListing[];
}

// --- Review ---

export interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string | null;
  content: string;
  date: string;
  isVerified: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
}

// --- Wishlist ---

export interface WishlistItem {
  id: string;
  collectionName: string;
  note: string | null;
  addedAt: string;
  product: ProductCard;
}

// --- Alert ---

export interface Alert {
  id: string;
  alertType: "price" | "stock";
  targetPrice: number | null;
  isActive: boolean;
  triggerCount: number;
  lastTriggeredAt: string | null;
  createdAt: string;
  product: ProductCard;
}

// --- Search ---

export interface SearchSuggestion {
  type: "product" | "category" | "brand" | "seller";
  label: string;
  slug: string;
  thumbnail?: string;
}

// --- Compare ---

export interface CompareProduct extends ProductDetail {
  isCheapest: boolean;
  isHighestRated: boolean;
  isBestValue: boolean;
}

// --- User ---

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  phone: string | null;
  role: "user" | "seller" | "admin";
  createdAt: string;
}
