// =============================================================================
// Andromeda — Third-Party Aggregator Service
// Simulates Amazon, Flipkart, and Meesho listings with realistic pricing/shipping.
// =============================================================================

export interface MarketplaceListing {
  id: string;
  source: "amazon" | "flipkart" | "meesho" | "local";
  sellerId?: string;
  sellerName: string;
  isVerified: boolean;
  price: number;
  originalPrice?: number;
  stock: number;
  deliveryDays: number; // 0 represents same-day/instant
  deliveryFee: number;
  rating: number;
  shopUrl: string;
  isCheapest?: boolean;
  isFastest?: boolean;
}

export function getMarketplaceListings(
  productId: string,
  productTitle: string,
  basePrice: number
): MarketplaceListing[] {
  // Generate a deterministic numeric hash from the productId to keep mock values consistent
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash << 5) - hash + productId.charCodeAt(i);
    hash |= 0;
  }
  const seed = Math.abs(hash);

  // 1. Amazon India Simulation
  // Price: slightly lower/higher (-3% to +3%), Delivery: 1-2 days, Rating: 4.3 to 4.8
  const amazonPriceOffset = -0.03 + (seed % 7) * 0.01;
  const amazonPrice = Math.round(basePrice * (1 + amazonPriceOffset));
  const amazonDeliveryDays = 1 + (seed % 2);
  const amazonDeliveryFee = amazonPrice > 499 ? 0 : 40;
  const amazonRating = 4.3 + (seed % 6) * 0.1;

  // 2. Flipkart Simulation
  // Price: slightly lower/higher (-2% to +2%), Delivery: 2-3 days, Rating: 4.1 to 4.7
  const flipkartPriceOffset = -0.02 + ((seed + 2) % 5) * 0.01;
  const flipkartPrice = Math.round(basePrice * (1 + flipkartPriceOffset));
  const flipkartDeliveryDays = 2 + (seed % 2);
  const flipkartDeliveryFee = flipkartPrice > 500 ? 0 : 50;
  const flipkartRating = 4.1 + (seed % 7) * 0.1;

  // 3. Meesho Simulation
  // Price: significantly lower (-8% to -5%), Delivery: 4-6 days, Free delivery, Rating: 3.8 to 4.3
  const meeshoPriceOffset = -0.08 + (seed % 4) * 0.01;
  const meeshoPrice = Math.round(basePrice * (1 + meeshoPriceOffset));
  const meeshoDeliveryDays = 4 + (seed % 3);
  const meeshoDeliveryFee = 0;
  const meeshoRating = 3.8 + (seed % 6) * 0.1;

  return [
    {
      id: `${productId}-amazon`,
      source: "amazon",
      sellerName: "Amazon India",
      isVerified: true,
      price: amazonPrice,
      stock: 100, // mock stock
      deliveryDays: amazonDeliveryDays,
      deliveryFee: amazonDeliveryFee,
      rating: Math.round(amazonRating * 10) / 10,
      shopUrl: `https://www.amazon.in/s?k=${encodeURIComponent(productTitle)}`,
    },
    {
      id: `${productId}-flipkart`,
      source: "flipkart",
      sellerName: "Flipkart",
      isVerified: true,
      price: flipkartPrice,
      stock: 50,
      deliveryDays: flipkartDeliveryDays,
      deliveryFee: flipkartDeliveryFee,
      rating: Math.round(flipkartRating * 10) / 10,
      shopUrl: `https://www.flipkart.com/search?q=${encodeURIComponent(productTitle)}`,
    },
    {
      id: `${productId}-meesho`,
      source: "meesho",
      sellerName: "Meesho",
      isVerified: false,
      price: meeshoPrice,
      stock: 200,
      deliveryDays: meeshoDeliveryDays,
      deliveryFee: meeshoDeliveryFee,
      rating: Math.round(meeshoRating * 10) / 10,
      shopUrl: `https://meesho.com/search?q=${encodeURIComponent(productTitle)}`,
    },
  ];
}
