export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface PricePoint {
  date: string;
  price: number;
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

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  slug: string;
  description: string;
  images: string[];
  price: number; // starting (lowest) price
  listPrice: number; // original price for discount display
  stock: number; // aggregate stock
  categoryId: string;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  sellers: SellerListing[];
  priceHistory: PricePoint[];
  reviews: Review[];
}

export const CATEGORIES: Category[] = [
  { id: "cat-1", name: "Electronics", slug: "electronics", icon: "Laptop" },
  { id: "cat-2", name: "Home & Kitchen", slug: "home-kitchen", icon: "Home" },
  { id: "cat-3", name: "Books", slug: "books", icon: "BookOpen" },
  { id: "cat-4", name: "Fashion", slug: "fashion", icon: "Shirt" }
];

export const PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Nebula X1 Pro Smartphone",
    brand: "CosmicTech",
    slug: "nebula-x1-pro-smartphone",
    description: "Experience the next frontier of mobile performance. The Nebula X1 Pro features a stunning 120Hz AMOLED display, the latest Kepler octa-core processor, and a quad-lens observatory camera system designed to capture the universe in spectacular detail. Equipped with all-day interstellar battery capacity and ultra-fast charging.",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
    ],
    price: 64999,
    listPrice: 74999,
    stock: 45,
    categoryId: "cat-1",
    rating: 4.8,
    reviewCount: 156,
    specs: {
      "Display": "6.7-inch AMOLED, 120Hz, HDR10+",
      "Processor": "Kepler 900 Octa-Core (4nm)",
      "RAM": "12GB LPDDR5X",
      "Storage": "256GB UFS 4.0",
      "Battery": "5000 mAh with 100W StarCharge",
      "OS": "Andromeda OS (based on Android 15)"
    },
    sellers: [
      {
        sellerId: "sell-1",
        sellerName: "AstroMarket",
        isVerified: true,
        price: 64999,
        stock: 12,
        deliveryDays: 2,
        rating: 4.7,
        shopUrl: "#"
      },
      {
        sellerId: "sell-2",
        sellerName: "Galaxy Retailers",
        isVerified: true,
        price: 66499,
        stock: 20,
        deliveryDays: 1,
        rating: 4.9,
        shopUrl: "#"
      },
      {
        sellerId: "sell-3",
        sellerName: "StarShop Electronics",
        isVerified: false,
        price: 65200,
        stock: 13,
        deliveryDays: 3,
        rating: 4.2,
        shopUrl: "#"
      }
    ],
    priceHistory: [
      { date: "Jan", price: 72000 },
      { date: "Feb", price: 71500 },
      { date: "Mar", price: 69999 },
      { date: "Apr", price: 68000 },
      { date: "May", price: 66000 },
      { date: "Jun", price: 64999 }
    ],
    reviews: [
      { id: "rev-1-1", userName: "Aditya K.", rating: 5, comment: "Absolutely brilliant phone! Camera quality is stellar, and screen transitions are smooth like butter.", date: "2026-06-15", isVerified: true },
      { id: "rev-1-2", userName: "Priya S.", rating: 4, comment: "Excellent display and build quality. The battery lasts well over a day. Deducted one star because the charger is sold separately by some vendors.", date: "2026-06-10", isVerified: true },
      { id: "rev-1-3", userName: "Rohit M.", rating: 5, comment: "Astrophotography mode works like a charm! Highly recommended for star gazers.", date: "2026-05-28", isVerified: false }
    ]
  },
  {
    id: "prod-2",
    title: "Nova Sound ANC Wireless Headphones",
    brand: "AeroAcoustics",
    slug: "nova-sound-anc-headphones",
    description: "Tune out the world and lose yourself in audio clarity. The Nova Sound Wireless Headphones offer industry-leading Active Noise Cancellation (ANC), custom 40mm aerospace drivers, and up to 50 hours of wireless playback on a single charge. Features plush memory foam earcups and a foldable lightweight design.",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
    ],
    price: 14999,
    listPrice: 19999,
    stock: 82,
    categoryId: "cat-1",
    rating: 4.6,
    reviewCount: 312,
    specs: {
      "Driver Size": "40mm Custom Dynamic",
      "Noise Cancelling": "Adaptive Hybrid ANC (up to 42dB)",
      "Battery Life": "50 Hours (ANC Off) / 38 Hours (ANC On)",
      "Bluetooth Version": "Bluetooth 5.4 with Multipoint Connect",
      "Weight": "250g",
      "Codec Support": "AAC, LDAC, SBC"
    },
    sellers: [
      {
        sellerId: "sell-1",
        sellerName: "AstroMarket",
        isVerified: true,
        price: 15499,
        stock: 32,
        deliveryDays: 2,
        rating: 4.7,
        shopUrl: "#"
      },
      {
        sellerId: "sell-4",
        sellerName: "Sonic Hub",
        isVerified: true,
        price: 14999,
        stock: 15,
        deliveryDays: 3,
        rating: 4.6,
        shopUrl: "#"
      },
      {
        sellerId: "sell-3",
        sellerName: "StarShop Electronics",
        isVerified: false,
        price: 15199,
        stock: 35,
        deliveryDays: 4,
        rating: 4.2,
        shopUrl: "#"
      }
    ],
    priceHistory: [
      { date: "Jan", price: 18000 },
      { date: "Feb", price: 17500 },
      { date: "Mar", price: 16999 },
      { date: "Apr", price: 15999 },
      { date: "May", price: 15499 },
      { date: "Jun", price: 14999 }
    ],
    reviews: [
      { id: "rev-2-1", userName: "Ananya B.", rating: 5, comment: "Noise cancellation is amazing, silences everything on my metro rides! Sound quality is clear and balanced.", date: "2026-06-18", isVerified: true },
      { id: "rev-2-2", userName: "Gaurav R.", rating: 4, comment: "Sound is top-notch. Build is sturdy. It gets slightly warm on the ears after 3-4 hours of continuous usage.", date: "2026-06-02", isVerified: true }
    ]
  },
  {
    id: "prod-3",
    title: "Cosmic Brew Smart Coffee Maker",
    brand: "Kepler Home",
    slug: "cosmic-brew-coffee-maker",
    description: "Wake up to the aroma of freshly ground, perfectly brewed coffee programmed right from your smartphone. The Cosmic Brew Coffee Maker combines precision temperature control, an integrated conical burr grinder, and scheduling options to deliver barista-quality espresso or drip coffee right at home.",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"
    ],
    price: 8999,
    listPrice: 11999,
    stock: 22,
    categoryId: "cat-2",
    rating: 4.4,
    reviewCount: 94,
    specs: {
      "Capacity": "12 Cups (1.8 Litres)",
      "Grinder": "Conical Burr Grinder (8 coarseness settings)",
      "Pump Pressure": "15 Bar Italian Pump",
      "Connectivity": "Wi-Fi 2.4GHz & Bluetooth (iOS/Android App)",
      "Heating System": "ThermoBlock Rapid Heating"
    },
    sellers: [
      {
        sellerId: "sell-2",
        sellerName: "Galaxy Retailers",
        isVerified: true,
        price: 8999,
        stock: 5,
        deliveryDays: 1,
        rating: 4.9,
        shopUrl: "#"
      },
      {
        sellerId: "sell-5",
        sellerName: "Home Planet",
        isVerified: true,
        price: 9499,
        stock: 12,
        deliveryDays: 2,
        rating: 4.5,
        shopUrl: "#"
      },
      {
        sellerId: "sell-6",
        sellerName: "Kitchen Tech",
        isVerified: false,
        price: 9200,
        stock: 5,
        deliveryDays: 4,
        rating: 4.0,
        shopUrl: "#"
      }
    ],
    priceHistory: [
      { date: "Jan", price: 10999 },
      { date: "Feb", price: 10999 },
      { date: "Mar", price: 9999 },
      { date: "Apr", price: 9499 },
      { date: "May", price: 8999 },
      { date: "Jun", price: 8999 }
    ],
    reviews: [
      { id: "rev-3-1", userName: "Neha J.", rating: 5, comment: "I can trigger my morning coffee right from my bed. The app is intuitive and the coffee taste is amazing.", date: "2026-06-19", isVerified: true },
      { id: "rev-3-2", userName: "Amit P.", rating: 3, comment: "Great coffee but cleaning the grinder takes time. App disconnected once and had to reset.", date: "2026-06-05", isVerified: true }
    ]
  },
  {
    id: "prod-4",
    title: "Andromeda Astronomy Guidebook",
    brand: "Nebula Press",
    slug: "andromeda-astronomy-guidebook",
    description: "The ultimate visual encyclopedia and field manual for observing the cosmos. Written by leading astrophysicists, this comprehensive book contains sky maps, coordinates for stargazing, full-color space telescope photographs, and step-by-step instructions to find distant galaxies, including our cosmic neighbor, the Andromeda Galaxy.",
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
    ],
    price: 1299,
    listPrice: 1599,
    stock: 120,
    categoryId: "cat-3",
    rating: 4.9,
    reviewCount: 48,
    specs: {
      "Format": "Hardcover, Special Edition",
      "Pages": "384 Pages",
      "Language": "English",
      "Dimensions": "20.3 x 3.2 x 25.4 cm",
      "Publisher": "Nebula Press (April 2025)"
    },
    sellers: [
      {
        sellerId: "sell-7",
        sellerName: "CosmoBooks",
        isVerified: true,
        price: 1299,
        stock: 50,
        deliveryDays: 3,
        rating: 4.8,
        shopUrl: "#"
      },
      {
        sellerId: "sell-8",
        sellerName: "Universal Book Store",
        isVerified: false,
        price: 1399,
        stock: 70,
        deliveryDays: 2,
        rating: 4.4,
        shopUrl: "#"
      }
    ],
    priceHistory: [
      { date: "Jan", price: 1499 },
      { date: "Feb", price: 1450 },
      { date: "Mar", price: 1399 },
      { date: "Apr", price: 1299 },
      { date: "May", price: 1299 },
      { date: "Jun", price: 1299 }
    ],
    reviews: [
      { id: "rev-4-1", userName: "Vikram R.", rating: 5, comment: "Breathtaking images and incredibly simple instructions. Even a beginner like me was able to locate nebula formations.", date: "2026-06-20", isVerified: true }
    ]
  },
  {
    id: "prod-5",
    title: "Solar Flare Lightweight Running Shoes",
    brand: "AeroSport",
    slug: "solar-flare-running-shoes",
    description: "Ignite your speed with Solar Flare. Engineered with hyper-reactive carbon-fiber plating and nitrogen-infused foam mid-soles, these shoes provide maximum energy return and spring with each stride. The breathable knitted upper acts like a second skin, keeping your feet ventilated even during high-intensity training.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
    ],
    price: 7999,
    listPrice: 9999,
    stock: 35,
    categoryId: "cat-4",
    rating: 4.5,
    reviewCount: 78,
    specs: {
      "Type": "Road Running, Performance Racing",
      "Midsole": "Helios Nitrogen Foam + Full-length Carbon Plate",
      "Arch Support": "Neutral",
      "Drop": "8mm",
      "Weight": "195g (Size 9)"
    },
    sellers: [
      {
        sellerId: "sell-9",
        sellerName: "AeroSport Official",
        isVerified: true,
        price: 8499,
        stock: 15,
        deliveryDays: 2,
        rating: 4.9,
        shopUrl: "#"
      },
      {
        sellerId: "sell-2",
        sellerName: "Galaxy Retailers",
        isVerified: true,
        price: 7999,
        stock: 10,
        deliveryDays: 1,
        rating: 4.9,
        shopUrl: "#"
      },
      {
        sellerId: "sell-10",
        sellerName: "Sprint Hub",
        isVerified: false,
        price: 8200,
        stock: 10,
        deliveryDays: 3,
        rating: 4.3,
        shopUrl: "#"
      }
    ],
    priceHistory: [
      { date: "Jan", price: 9500 },
      { date: "Feb", price: 9000 },
      { date: "Mar", price: 8500 },
      { date: "Apr", price: 8200 },
      { date: "May", price: 7999 },
      { date: "Jun", price: 7999 }
    ],
    reviews: [
      { id: "rev-5-1", userName: "Deepak T.", rating: 5, comment: "I set a personal record in my 10k race wearing these! Super springy and feels like running on air.", date: "2026-06-22", isVerified: true },
      { id: "rev-5-2", userName: "Meera K.", rating: 4, comment: "Very comfortable and light. Sizes run slightly small so order half a size up.", date: "2026-06-11", isVerified: false }
    ]
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (!category) return [];
  return PRODUCTS.filter((p) => p.categoryId === category.id);
}

export function getProductsBySearch(query: string): Product[] {
  if (!query) return PRODUCTS;
  const normalizedQuery = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(normalizedQuery) ||
      p.brand.toLowerCase().includes(normalizedQuery) ||
      p.description.toLowerCase().includes(normalizedQuery)
  );
}

export function getProductsForComparison(ids: string[]): Product[] {
  return PRODUCTS.filter((p) => ids.includes(p.id));
}
