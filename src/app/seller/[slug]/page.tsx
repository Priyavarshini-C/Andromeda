// =============================================================================
// Andromeda — Premium Public Seller Profile Page (Rose Gold Overhaul)
// =============================================================================

import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, MapPin, Phone, Mail, Calendar, Star, Store, ArrowRight, ExternalLink } from "lucide-react";
import { db } from "@/lib/db";
import { sellers, products } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/utils/mock-data";

export async function generateStaticParams() {
  try {
    const allSellers = await db.select({ slug: sellers.slug }).from(sellers);
    const result = allSellers.map((s: any) => ({ slug: s.slug }));
    return result.length > 0 ? result : [{ slug: "cosmobooks" }, { slug: "starshop" }];
  } catch (err) {
    console.warn("Skipping seller generateStaticParams due to DB error:", err);
    return [{ slug: "cosmobooks" }, { slug: "starshop" }];
  }
}

interface SellerProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function SellerProfilePage({ params }: SellerProfilePageProps) {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs text-smoke font-light">Loading atelier...</div>}>
      <SellerProfileContent params={params} />
    </Suspense>
  );
}

async function SellerProfileContent({ params }: SellerProfilePageProps) {
  const { slug } = await params;

  // Query seller from DB
  const sellerResult = await db
    .select()
    .from(sellers)
    .where(eq(sellers.slug, slug))
    .limit(1);

  if (sellerResult.length === 0) {
    if (slug !== "cosmobooks" && slug !== "starshop") {
      notFound();
    }
  }

  const seller = sellerResult[0] || {
    id: "mock-id",
    businessName: slug === "cosmobooks" ? "CosmoBooks" : "StarShop Electronics",
    slug,
    isVerified: true,
    rating: 4.8,
    phone: "+91 98765 43210",
    email: "atelier@cosmobooks.in",
    createdAt: new Date("2025-01-15"),
    description: "We curate premium publications, fine stationery, and architectural logs. Established in 2025 in the heart of Bengaluru.",
    city: "Bengaluru",
  };

  // Fetch products by this seller from DB
  const sellerDbProducts = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, seller.id))
    .orderBy(desc(products.createdAt));

  // Map to frontend Product type
  const mappedProducts: Product[] = sellerDbProducts.map((p: any) => {
    let images: string[] = [];
    try {
      images = JSON.parse(p.images);
    } catch {
      images = p.images ? [p.images] : [];
    }
    return {
      id: p.id,
      title: p.title,
      brand: p.brand || "",
      slug: p.slug,
      description: p.description || "",
      images,
      price: p.price,
      listPrice: p.originalPrice || p.price,
      stock: p.stock,
      categoryId: p.categoryId,
      rating: p.rating || 4.5,
      reviewCount: p.reviewCount || 0,
      sellers: [],
      priceHistory: [],
      reviews: [],
      specs: {},
    };
  });

  // Fallback mock catalog for showcase
  const displayProducts = mappedProducts.length > 0 ? mappedProducts : [
    {
      id: "mock-p1",
      title: "The Minimalist Journal — Charcoal Edition",
      brand: "Andromeda Atelier",
      slug: "minimalist-journal",
      description: "Fine ivory parchment sheets inside a soft charcoal cover.",
      images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop"],
      price: 1800,
      listPrice: 2200,
      stock: 12,
      categoryId: "books",
      rating: 4.9,
      reviewCount: 34,
      sellers: [],
      priceHistory: [],
      reviews: [],
      specs: {},
    },
    {
      id: "mock-p2",
      title: "Instrument Fountain Pen — Gold Nib",
      brand: "Andromeda Atelier",
      slug: "instrument-fountain-pen",
      description: "Fine-writing tool crafted with a solid 14k gold nib.",
      images: ["https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=600&auto=format&fit=crop"],
      price: 6500,
      listPrice: 7500,
      stock: 4,
      categoryId: "books",
      rating: 4.8,
      reviewCount: 19,
      sellers: [],
      priceHistory: [],
      reviews: [],
      specs: {},
    }
  ];

  return (
    <div className="w-full bg-[#F5EDE4] text-charcoal">
      
      {/* Cover Banner */}
      <div 
        className="h-64 w-full bg-[#1C1410] relative flex items-end px-8 md:px-24 pb-8"
        style={{
          backgroundImage: "radial-gradient(rgba(192,120,64,0.12) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#F5EDE4] via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 translate-y-12 w-full">
          {/* Avatar */}
          <div className="h-28 w-28 rounded-full border-4 border-[#FAF6F2] bg-charcoal flex items-center justify-center text-[#FAF6F2] shadow-luxury-light shrink-0">
            <Store className="h-10 w-10 text-goldmist" />
          </div>

          <div className="text-center sm:text-left flex-grow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-3xl font-semibold text-charcoal tracking-tight">
                {seller.businessName}
              </h1>
              {seller.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#C07840] bg-[#FAF6F2] border border-[#E8D8CE] px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit mx-auto sm:mx-0">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified Seller
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-xs text-smoke font-light mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-rose" /> {seller.city || "Bengaluru"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-current text-goldmist" /> {seller.rating?.toFixed(1) || "4.8"} Rating
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 shrink-0">
            <button className="border border-[#C4607A] text-[#C4607A] hover:bg-white rounded px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
              Follow Store
            </button>
            <button className="bg-[#8B3A52] hover:bg-[#C4607A] text-[#FAF6F2] rounded px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer">
              Contact
            </button>
          </div>
        </div>
      </div>

      <div className="h-20" />

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="border-b border-[#E8D8CE] flex gap-8">
            <button className="pb-3 text-xs uppercase tracking-[2px] font-semibold border-b-2 border-[#8B3A52] text-[#8B3A52]">
              Atelier Listings
            </button>
            <button className="pb-3 text-xs uppercase tracking-[2px] font-medium text-smoke hover:text-charcoal transition-colors">
              Customer Log Reviews
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-ivory border border-[#E8D8CE] rounded-xl p-6 shadow-luxury-light">
            <div className="flex items-center justify-between mb-4 border-b border-[#E8D8CE] pb-3">
              <h3 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal">
                Atelier Overview
              </h3>
              <span className="bg-[#E1F5EE] text-[#085041] text-[9px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                Open Now
              </span>
            </div>
            
            <p className="text-xs leading-relaxed text-smoke font-light">
              {seller.description || "No biography provided by the seller atelier."}
            </p>

            <div className="mt-6 space-y-3.5 text-xs text-smoke font-light">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-rose" />
                <span>{seller.phone || "+91 98765 43210"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-rose" />
                <span>{seller.email || "contact@atelier.in"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-rose" />
                <span>Cataloged since {new Date(seller.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          <div className="bg-ivory border border-[#E8D8CE] rounded-xl p-6 shadow-luxury-light">
            <h3 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal mb-4 border-b border-[#E8D8CE] pb-3">
              Reliability Score
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-charcoal mb-1">
                  <span>Product Quality</span>
                  <span>96%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E8D8CE] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B3A52] rounded-full" style={{ width: "96%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-charcoal mb-1">
                  <span>On-time Delivery</span>
                  <span>92%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E8D8CE] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B3A52] rounded-full" style={{ width: "92%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-charcoal mb-1">
                  <span>Customer Support</span>
                  <span>88%</span>
                </div>
                <div className="h-1.5 w-full bg-[#E8D8CE] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B3A52] rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-ivory border border-[#E8D8CE] rounded-xl p-6 shadow-luxury-light flex flex-col justify-between h-56">
            <div>
              <h3 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal mb-1">
                Regional Location
              </h3>
              <p className="text-[10px] text-smoke font-light flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-rose" /> {seller.city || "Bengaluru"}, India
              </p>
            </div>
            
            <div className="h-28 w-full bg-[#F5EDE4] rounded border border-[#E8D8CE] relative flex items-center justify-center overflow-hidden">
              <div 
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: "radial-gradient(rgba(139,58,82,0.15) 1.5px, transparent 1.5px)",
                  backgroundSize: "16px 16px"
                }}
              />
              <div className="relative z-10 flex flex-col items-center gap-1.5 animate-bounce">
                <MapPin className="h-6 w-6 text-[#8B3A52]" />
                <span className="text-[9px] font-semibold uppercase tracking-wider bg-white px-2 py-0.5 border border-[#E8D8CE] rounded">
                  Atelier
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
