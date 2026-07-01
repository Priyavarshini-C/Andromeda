// =============================================================================
// Andromeda — Database Seed Script (PostgreSQL)
// Run with: npx tsx src/lib/db/seed.ts
// =============================================================================

import { db, conn } from "./index";
import { users, sellers, categories, products, priceHistory, reviews } from "./schema";
import { hashSync } from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  console.log("⏳ Seeding database...");

  const demoPassword = hashSync("password123", 10);
  const now = new Date();

  // 1. Clear existing data
  console.log("🧹 Clearing old data...");
  await db.delete(reviews);
  await db.delete(priceHistory);
  await db.delete(products);
  await db.delete(sellers);
  await db.delete(categories);
  await db.delete(users);

  // 2. Insert Users
  console.log("👤 Seeding users...");
  const adminId = crypto.randomUUID();
  const buyerId = crypto.randomUUID();
  const seller1Id = crypto.randomUUID();
  const seller2Id = crypto.randomUUID();
  const seller3Id = crypto.randomUUID();
  const seller4Id = crypto.randomUUID();
  const seller5Id = crypto.randomUUID();
  const seller6Id = crypto.randomUUID();
  const seller7Id = crypto.randomUUID();
  const seller8Id = crypto.randomUUID();
  const seller9Id = crypto.randomUUID();
  const seller10Id = crypto.randomUUID();

  const reviewerIds = Array.from({ length: 8 }, () => crypto.randomUUID());

  await db.insert(users).values([
    { id: adminId, name: "Admin", email: "admin@andromeda.app", passwordHash: demoPassword, role: "admin", isActive: true },
    { id: buyerId, name: "Demo User", email: "user@andromeda.app", passwordHash: demoPassword, role: "user", isActive: true },
    { id: seller1Id, name: "AstroMarket Owner", email: "seller1@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller2Id, name: "Galaxy Retailers Owner", email: "seller2@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller3Id, name: "StarShop Owner", email: "seller3@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller4Id, name: "Sonic Hub Owner", email: "seller4@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller5Id, name: "Home Planet Owner", email: "seller5@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller6Id, name: "Kitchen Tech Owner", email: "seller6@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller7Id, name: "CosmoBooks Owner", email: "seller7@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller8Id, name: "Universal Book Store Owner", email: "seller8@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller9Id, name: "AeroSport Owner", email: "seller9@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    { id: seller10Id, name: "Sprint Hub Owner", email: "seller10@andromeda.app", passwordHash: demoPassword, role: "seller", isActive: true },
    // Reviewers
    { id: reviewerIds[0], name: "Aditya K.", email: "aditya@example.com", passwordHash: demoPassword, role: "user", isActive: true },
    { id: reviewerIds[1], name: "Priya S.", email: "priya.s@example.com", passwordHash: demoPassword, role: "user", isActive: true },
    { id: reviewerIds[2], name: "Rohit M.", email: "rohit@example.com", passwordHash: demoPassword, role: "user", isActive: true },
    { id: reviewerIds[3], name: "Ananya B.", email: "ananya@example.com", passwordHash: demoPassword, role: "user", isActive: true },
    { id: reviewerIds[4], name: "Gaurav R.", email: "gaurav@example.com", passwordHash: demoPassword, role: "user", isActive: true },
    { id: reviewerIds[5], name: "Neha J.", email: "neha@example.com", passwordHash: demoPassword, role: "user", isActive: true },
    { id: reviewerIds[6], name: "Amit P.", email: "amit@example.com", passwordHash: demoPassword, role: "user", isActive: true },
    { id: reviewerIds[7], name: "Vikram R.", email: "vikram@example.com", passwordHash: demoPassword, role: "user", isActive: true },
  ]);

  // 3. Insert Sellers
  console.log("🏢 Seeding sellers...");
  const sIds = Array.from({ length: 10 }, () => crypto.randomUUID());

  const sellerData = [
    { id: sIds[0], userId: seller1Id, businessName: "AstroMarket", businessType: "direct", slug: "astromarket", description: "Premium electronics & gadgets. Authorized dealer for top brands.", addressLine1: "42 MG Road, Brigade Gateway", city: "Bengaluru", state: "Karnataka", pincode: "560001", isVerified: true, rating: 4.7, latitude: 12.9716, longitude: 77.5946, businessHours: '{"mon-sat": "10:00-21:00", "sun": "11:00-19:00"}', phone: "+91 80 4567 1234", email: "contact@astromarket.in" },
    { id: sIds[1], userId: seller2Id, businessName: "Galaxy Retailers", businessType: "direct", slug: "galaxy-retailers", description: "India's trusted multi-category retailer. Best prices, genuine products.", addressLine1: "15 Anna Salai, T. Nagar", city: "Chennai", state: "Tamil Nadu", pincode: "600017", isVerified: true, rating: 4.9, latitude: 13.0827, longitude: 80.2707, businessHours: '{"mon-sat": "09:30-21:30", "sun": "10:00-20:00"}', phone: "+91 44 2834 5678", email: "hello@galaxyretailers.in" },
    { id: sIds[2], userId: seller3Id, businessName: "StarShop Electronics", businessType: "direct", slug: "starshop-electronics", description: "Your neighbourhood electronics expert. Competitive prices on all gadgets.", addressLine1: "78 FC Road, Shivajinagar", city: "Pune", state: "Maharashtra", pincode: "411005", isVerified: false, rating: 4.2, latitude: 18.5204, longitude: 73.8567, businessHours: '{"mon-sat": "10:00-20:30", "sun": "closed"}', phone: "+91 20 2567 8901", email: "sales@starshop.in" },
    { id: sIds[3], userId: seller4Id, businessName: "Sonic Hub", businessType: "direct", slug: "sonic-hub", description: "Audio specialists — headphones, speakers, and sound systems.", addressLine1: "22 Linking Road, Bandra West", city: "Mumbai", state: "Maharashtra", pincode: "400050", isVerified: true, rating: 4.6, latitude: 19.0596, longitude: 72.8295, businessHours: '{"mon-sat": "11:00-22:00", "sun": "12:00-20:00"}', phone: "+91 22 2645 3456", email: "support@sonichub.in" },
    { id: sIds[4], userId: seller5Id, businessName: "Home Planet", businessType: "direct", slug: "home-planet", description: "Premium home appliances and kitchen solutions for modern living.", addressLine1: "5 Park Street, Elgin", city: "Kolkata", state: "West Bengal", pincode: "700016", isVerified: true, rating: 4.5, latitude: 22.5726, longitude: 88.3639, businessHours: '{"mon-sat": "10:00-20:00", "sun": "11:00-18:00"}', phone: "+91 33 2229 0123", email: "info@homeplanet.in" },
    { id: sIds[5], userId: seller6Id, businessName: "Kitchen Tech", businessType: "direct", slug: "kitchen-tech", description: "Smart kitchen appliances and cookware for the modern chef.", addressLine1: "101 Connaught Place, Block A", city: "New Delhi", state: "Delhi", pincode: "110001", isVerified: false, rating: 4.0, latitude: 28.6139, longitude: 77.2090, businessHours: '{"mon-sat": "10:30-21:00", "sun": "11:00-19:00"}', phone: "+91 11 2341 5678", email: "orders@kitchentech.in" },
    { id: sIds[6], userId: seller7Id, businessName: "CosmoBooks", businessType: "website", slug: "cosmobooks", description: "Curated book collections — bestsellers, classics, and rare finds.", addressLine1: "33 Church Street, Ashok Nagar", city: "Bengaluru", state: "Karnataka", pincode: "560001", isVerified: true, rating: 4.8, latitude: 12.9750, longitude: 77.6040, businessHours: '{"mon-sat": "09:00-21:00", "sun": "10:00-20:00"}', phone: "+91 80 2558 9012", email: "hello@cosmobooks.in" },
    { id: sIds[7], userId: seller8Id, businessName: "Universal Book Store", businessType: "website", slug: "universal-book-store", description: "Books for every reader — academic, fiction, non-fiction, and children's.", addressLine1: "67 Abids Road, Koti", city: "Hyderabad", state: "Telangana", pincode: "500001", isVerified: false, rating: 4.4, latitude: 17.3850, longitude: 78.4867, businessHours: '{"mon-sat": "09:30-20:30", "sun": "10:00-18:00"}', phone: "+91 40 2345 6789", email: "read@universalbooks.in" },
    { id: sIds[8], userId: seller9Id, businessName: "AeroSport Official", businessType: "direct", slug: "aerosport-official", description: "Official sportswear and athletic gear. Performance meets style.", addressLine1: "12 CG Road, Navrangpura", city: "Ahmedabad", state: "Gujarat", pincode: "380009", isVerified: true, rating: 4.9, latitude: 23.0225, longitude: 72.5714, businessHours: '{"mon-sat": "10:00-21:00", "sun": "10:00-20:00"}', phone: "+91 79 2656 7890", email: "shop@aerosport.in" },
    { id: sIds[9], userId: seller10Id, businessName: "Sprint Hub", businessType: "direct", slug: "sprint-hub", description: "Fitness gear, sportswear, and outdoor equipment for every adventure.", addressLine1: "89 MI Road, C-Scheme", city: "Jaipur", state: "Rajasthan", pincode: "302001", isVerified: false, rating: 4.3, latitude: 26.9124, longitude: 75.7873, businessHours: '{"mon-sat": "10:00-20:30", "sun": "11:00-19:00"}', phone: "+91 141 237 1234", email: "contact@sprinthub.in" },
  ];

  await db.insert(sellers).values(
    sellerData.map((s) => ({
      id: s.id,
      userId: s.userId,
      businessName: s.businessName,
      businessType: s.businessType,
      slug: s.slug,
      description: s.description,
      addressLine1: s.addressLine1,
      city: s.city,
      state: s.state,
      pincode: s.pincode,
      status: "active" as const,
      isVerified: s.isVerified,
      rating: s.rating,
      latitude: s.latitude,
      longitude: s.longitude,
      businessHours: s.businessHours,
      phone: s.phone,
      email: s.email,
    }))
  );

  // 4. Insert Categories
  console.log("🗂️ Seeding categories...");
  const cIds = Array.from({ length: 4 }, () => crypto.randomUUID());

  await db.insert(categories).values([
    { id: cIds[0], name: "Electronics", slug: "electronics", icon: "Laptop", sortOrder: 1, isActive: true },
    { id: cIds[1], name: "Home & Kitchen", slug: "home-kitchen", icon: "Home", sortOrder: 2, isActive: true },
    { id: cIds[2], name: "Books", slug: "books", icon: "BookOpen", sortOrder: 3, isActive: true },
    { id: cIds[3], name: "Fashion", slug: "fashion", icon: "Shirt", sortOrder: 4, isActive: true },
  ]);

  // 5. Insert Products
  console.log("📦 Seeding products...");
  const pIds = Array.from({ length: 5 }, () => crypto.randomUUID());

  const productData = [
    {
      id: pIds[0],
      sellerId: sIds[0], // AstroMarket
      categoryId: cIds[0], // Electronics
      title: "Nebula X1 Pro Smartphone",
      slug: "nebula-x1-pro-smartphone",
      description: "Experience the next frontier of mobile performance. The Nebula X1 Pro features a stunning 120Hz AMOLED display, the latest Kepler octa-core processor, and a quad-lens observatory camera system designed to capture the universe in spectacular detail.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
      ]),
      thumbnailUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      price: 64999,
      originalPrice: 74999,
      stock: 45,
      specs: JSON.stringify({
        "Display": "6.7-inch AMOLED, 120Hz, HDR10+",
        "Processor": "Kepler 900 Octa-Core (4nm)",
        "RAM": "12GB LPDDR5X",
        "Storage": "256GB UFS 4.0",
        "Battery": "5000 mAh with 100W StarCharge",
        "OS": "Andromeda OS (based on Android 15)"
      }),
      brand: "CosmicTech",
      isFeatured: true,
      rating: 4.8,
      reviewCount: 3,
    },
    {
      id: pIds[1],
      sellerId: sIds[3], // Sonic Hub
      categoryId: cIds[0], // Electronics
      title: "Nova Sound ANC Wireless Headphones",
      slug: "nova-sound-anc-headphones",
      description: "Tune out the world and lose yourself in audio clarity. The Nova Sound Wireless Headphones offer industry-leading Active Noise Cancellation, custom 40mm aerospace drivers, and up to 50 hours of wireless playback.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
      ]),
      thumbnailUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
      price: 14999,
      originalPrice: 19999,
      stock: 82,
      specs: JSON.stringify({
        "Driver Size": "40mm Custom Dynamic",
        "Noise Cancelling": "Adaptive Hybrid ANC (up to 42dB)",
        "Battery Life": "50 Hours (ANC Off) / 38 Hours (ANC On)",
        "Bluetooth Version": "Bluetooth 5.4 with Multipoint Connect",
        "Weight": "250g",
        "Codec Support": "AAC, LDAC, SBC"
      }),
      brand: "AeroAcoustics",
      isFeatured: true,
      rating: 4.6,
      reviewCount: 2,
    },
    {
      id: pIds[2],
      sellerId: sIds[1], // Galaxy Retailers
      categoryId: cIds[1], // Home & Kitchen
      title: "Cosmic Brew Smart Coffee Maker",
      slug: "cosmic-brew-coffee-maker",
      description: "Wake up to the aroma of freshly ground, perfectly brewed coffee programmed right from your smartphone. The Cosmic Brew Coffee Maker combines precision temperature control, an integrated conical burr grinder, and scheduling options.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80"
      ]),
      thumbnailUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80",
      price: 8999,
      originalPrice: 11999,
      stock: 22,
      specs: JSON.stringify({
        "Capacity": "12 Cups (1.8 Litres)",
        "Grinder": "Conical Burr Grinder (8 coarseness settings)",
        "Pump Pressure": "15 Bar Italian Pump",
        "Connectivity": "Wi-Fi 2.4GHz & Bluetooth (iOS/Android App)",
        "Heating System": "ThermoBlock Rapid Heating"
      }),
      brand: "Kepler Home",
      isFeatured: true,
      rating: 4.4,
      reviewCount: 2,
    },
    {
      id: pIds[3],
      sellerId: sIds[6], // CosmoBooks
      categoryId: cIds[2], // Books
      title: "Andromeda Astronomy Guidebook",
      slug: "andromeda-astronomy-guidebook",
      description: "The ultimate visual encyclopedia and field manual for observing the cosmos. Written by leading astrophysicists, this comprehensive book contains sky maps, coordinates for stargazing, and full-color space telescope photographs.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
      ]),
      thumbnailUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
      price: 1299,
      originalPrice: 1599,
      stock: 120,
      specs: JSON.stringify({
        "Format": "Hardcover, Special Edition",
        "Pages": "384 Pages",
        "Language": "English",
        "Dimensions": "20.3 x 3.2 x 25.4 cm",
        "Publisher": "Nebula Press (April 2025)"
      }),
      brand: "Nebula Press",
      isFeatured: true,
      rating: 4.9,
      reviewCount: 1,
    },
    {
      id: pIds[4],
      sellerId: sIds[1], // Galaxy Retailers
      categoryId: cIds[3], // Fashion
      title: "Solar Flare Lightweight Running Shoes",
      slug: "solar-flare-running-shoes",
      description: "Ignite your speed with Solar Flare. Engineered with hyper-reactive carbon-fiber plating and nitrogen-infused foam mid-soles, these shoes provide maximum energy return and spring with each stride.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80"
      ]),
      thumbnailUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      price: 7999,
      originalPrice: 9999,
      stock: 35,
      specs: JSON.stringify({
        "Type": "Road Running, Performance Racing",
        "Midsole": "Helios Nitrogen Foam + Full-length Carbon Plate",
        "Arch Support": "Neutral",
        "Drop": "8mm",
        "Weight": "195g (Size 9)"
      }),
      brand: "AeroSport",
      isFeatured: false,
      rating: 4.5,
      reviewCount: 2,
    },
  ];

  await db.insert(products).values(
    productData.map((p) => ({
      id: p.id,
      sellerId: p.sellerId,
      categoryId: p.categoryId,
      title: p.title,
      slug: p.slug,
      description: p.description,
      images: p.images,
      thumbnailUrl: p.thumbnailUrl,
      price: p.price,
      originalPrice: p.originalPrice,
      stock: p.stock,
      specs: p.specs,
      brand: p.brand,
      status: "active" as const,
      isFeatured: p.isFeatured,
      rating: p.rating,
      reviewCount: p.reviewCount,
    }))
  );

  // 6. Insert Price History
  console.log("📈 Seeding price history...");
  const phData = [
    // prod 1
    { productId: pIds[0], sellerId: sIds[0], price: 72000, monthOffset: -5 },
    { productId: pIds[0], sellerId: sIds[0], price: 71500, monthOffset: -4 },
    { productId: pIds[0], sellerId: sIds[0], price: 69999, monthOffset: -3 },
    { productId: pIds[0], sellerId: sIds[0], price: 68000, monthOffset: -2 },
    { productId: pIds[0], sellerId: sIds[0], price: 66000, monthOffset: -1 },
    { productId: pIds[0], sellerId: sIds[0], price: 64999, monthOffset: 0 },
    // prod 2
    { productId: pIds[1], sellerId: sIds[3], price: 18000, monthOffset: -5 },
    { productId: pIds[1], sellerId: sIds[3], price: 17500, monthOffset: -4 },
    { productId: pIds[1], sellerId: sIds[3], price: 16999, monthOffset: -3 },
    { productId: pIds[1], sellerId: sIds[3], price: 15999, monthOffset: -2 },
    { productId: pIds[1], sellerId: sIds[3], price: 15499, monthOffset: -1 },
    { productId: pIds[1], sellerId: sIds[3], price: 14999, monthOffset: 0 },
  ];

  await db.insert(priceHistory).values(
    phData.map((ph) => {
      const d = new Date();
      d.setMonth(d.getMonth() + ph.monthOffset);
      return {
        id: crypto.randomUUID(),
        productId: ph.productId,
        sellerId: ph.sellerId,
        price: ph.price,
        recordedAt: d,
      };
    })
  );

  // 7. Insert Reviews
  console.log("⭐ Seeding reviews...");
  const reviewsData = [
    { productId: pIds[0], userId: reviewerIds[0], rating: 5, content: "Absolutely brilliant phone! Camera quality is stellar, and screen transitions are smooth like butter.", isVerifiedPurchase: true },
    { productId: pIds[0], userId: reviewerIds[1], rating: 4, content: "Excellent display and build quality. The battery lasts well over a day. Deducted one star because the charger is sold separately.", isVerifiedPurchase: true },
    { productId: pIds[0], userId: reviewerIds[2], rating: 5, content: "Astrophotography mode works like a charm! Highly recommended for stargazers.", isVerifiedPurchase: false },
    { productId: pIds[1], userId: reviewerIds[3], rating: 5, content: "Noise cancellation is amazing, silences everything on my metro rides! Sound quality is clear and balanced.", isVerifiedPurchase: true },
    { productId: pIds[1], userId: reviewerIds[4], rating: 4, content: "Sound is top-notch. Build is sturdy. It gets slightly warm on the ears after 3-4 hours of continuous usage.", isVerifiedPurchase: true },
    { productId: pIds[2], userId: reviewerIds[5], rating: 5, content: "I can trigger my morning coffee right from my bed. The app is intuitive and the coffee taste is amazing.", isVerifiedPurchase: true },
    { productId: pIds[2], userId: reviewerIds[6], rating: 3, content: "Great coffee but cleaning the grinder takes time. App disconnected once and had to reset.", isVerifiedPurchase: true },
    { productId: pIds[3], userId: reviewerIds[7], rating: 5, content: "Breathtaking images and incredibly simple instructions. Even a beginner like me was able to locate nebula formations.", isVerifiedPurchase: true },
    { productId: pIds[4], userId: reviewerIds[0], rating: 5, content: "I set a personal record in my 10k race wearing these! Super springy and feels like running on air.", isVerifiedPurchase: true },
    { productId: pIds[4], userId: reviewerIds[3], rating: 4, content: "Very comfortable and light. Sizes run slightly small so order half a size up.", isVerifiedPurchase: false },
  ];

  await db.insert(reviews).values(
    reviewsData.map((r) => ({
      id: crypto.randomUUID(),
      productId: r.productId,
      userId: r.userId,
      rating: r.rating,
      content: r.content,
      isVerifiedPurchase: r.isVerifiedPurchase,
    }))
  );

  // 8. Update seller product counts
  console.log("🔄 Updating product counts on sellers...");
  for (const sid of sIds) {
    const prods = productData.filter((p) => p.sellerId === sid);
    await db
      .update(sellers)
      .set({ productCount: prods.length })
      .where(eq(sellers.id, sid));
  }

  console.log("✅ Database seeded successfully!");
  console.log("Demo accounts:");
  console.log("  - Admin:  admin@andromeda.app / password123");
  console.log("  - User:   user@andromeda.app  / password123");
  console.log("  - Seller: seller1@andromeda.app / password123");
}

main()
  .then(async () => {
    await conn?.end();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await conn?.end();
    process.exit(1);
  });
