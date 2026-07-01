// =============================================================================
// Andromeda — Premium Product Details Client Component (Rose Gold Overhaul)
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Scale, Heart, Check, ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useCompareStore } from "@/store/compare.store";
import StockBadge from "@/components/product/StockBadge";
import AddToWishlistButton from "@/components/product/AddToWishlistButton";

export interface CustomSellerListing {
  id: string;
  source: "amazon" | "flipkart" | "meesho" | "local";
  sellerId?: string;
  sellerName: string;
  isVerified: boolean;
  price: number;
  stock: number;
  deliveryDays: number;
  deliveryFee: number;
  rating: number;
  shopUrl: string;
}

export interface CustomProduct {
  id: string;
  title: string;
  brand: string;
  slug: string;
  description: string;
  images: string[];
  price: number;
  listPrice: number;
  stock: number;
  categoryId: string;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  sellers: CustomSellerListing[];
  priceHistory: { date: string; price: number }[];
  reviews: { id: string; userName: string; rating: number; comment: string; date: string; isVerified: boolean }[];
}

interface ProductDetailsClientProps {
  product: CustomProduct;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { id, title, brand, description, images, sellers, rating, reviewCount } = product;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const addCompare = useCompareStore((state) => state.add);
  const removeCompare = useCompareStore((state) => state.remove);
  const isCompared = useCompareStore((state) => state.isSelected(id));

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const handleCompareToggle = () => {
    if (isCompared) {
      removeCompare(id);
    } else {
      addCompare(id);
    }
  };

  // Find lowest price
  const lowestPrice = Math.min(...sellers.map((s) => s.price));
  const cheapestListing = sellers.reduce((cheapest, current) => {
    return (current.price + current.deliveryFee) < (cheapest.price + cheapest.deliveryFee) ? current : cheapest;
  }, sellers[0]);

  return (
    <div className="w-full bg-[#FAF6F2] py-8 text-charcoal">
      
      {/* ── Breadcrumbs ── */}
      <nav className="flex items-center gap-2 text-xs font-sans font-semibold mb-8 text-[#C4607A]">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="text-[#E8D8CE] font-normal font-sans">/</span>
        <Link href="/products" className="hover:underline">Products</Link>
        <span className="text-[#E8D8CE] font-normal font-sans">/</span>
        <span className="text-smoke font-normal">{title}</span>
      </nav>

      {/* ── 2-Column 55/45 Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 items-start mb-16">
        
        {/* Left Column (55% / 5 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          {/* Main Frame */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white border border-[#E8D8CE] shadow-luxury-light p-6">
            <Image
              src={images[activeImageIndex]}
              alt={title}
              fill
              priority
              className="object-contain p-4 hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
          
          {/* Gallery Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded bg-white transition-all cursor-pointer ${
                    activeImageIndex === index ? "border-2 border-[#8B3A52]" : "border border-[#E8D8CE] hover:border-[#8B3A52]/55"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${title} thumb ${index + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column (45% / 5 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="lg:col-span-5 flex flex-col gap-6"
        >
          <div>
            <span className="bg-[#F0E0D4] text-[#8B3A52] text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full tracking-wider w-fit block">
              Atelier Curated
            </span>
            
            <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-charcoal leading-snug">
              {title}
            </h1>
            
            <p className="text-xs text-smoke font-light mt-1">Brand: {brand}</p>
            
            {/* Ratings */}
            <div className="mt-3 flex items-center gap-1.5 border-b border-[#E8D8CE] pb-4">
              <div className="flex items-center text-goldmist">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(rating) ? "fill-current" : "text-zinc-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-charcoal">{rating.toFixed(1)}</span>
              <span className="text-xs text-smoke font-light">({reviewCount} reviews)</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#C07840]">
                ₹{lowestPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs text-smoke font-medium">
                across {sellers.length} sellers
              </span>
            </div>
            
            <p className="mt-4 text-sm font-normal leading-7 text-smoke">
              {description}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex gap-4 items-center">
            {/* Add to Wishlist */}
            <AddToWishlistButton productId={id} size="md" />

            {/* Compare Toggle */}
            <button
              onClick={handleCompareToggle}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded border border-[#C4607A] text-[#C4607A] hover:bg-parchment text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              {mounted && isCompared ? (
                <>
                  <Check className="h-4 w-4" />
                  Calibrated
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4" />
                  Add to Compare
                </>
              )}
            </button>
          </div>

          {/* Primary CTA */}
          <motion.a
            href={`#compare-table-section`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#8B3A52] text-[#FAF6F2] py-4 rounded-[10px] text-xs font-semibold uppercase tracking-wider transition-colors text-center hover:bg-[#C4607A] shadow-luxury-light"
          >
            View Best Price →
          </motion.a>

        </motion.div>

      </div>

      {/* ── AI Summary Card ── */}
      <div className="liquid-glass-strong rounded-xl p-6 bg-[#2E1F16] border-l-4 border-[#C07840] mb-12 shadow-luxury-dark">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[#C07840] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-sans font-semibold text-ivory tracking-wider uppercase mb-1 flex items-center gap-1.5">
              AI Market Summary
            </h3>
            <p className="text-sm font-sans font-light italic leading-7 text-[#E8C99A]">
              We parsed all listed inventory details. The optimal purchase path is through &ldquo;{cheapestListing.sellerName}&rdquo; offering a total rate of ₹{(cheapestListing.price + cheapestListing.deliveryFee).toLocaleString("en-IN")} including immediate delivery.
            </p>
          </div>
        </div>
      </div>

      {/* ── Price Comparison Table Section ── */}
      <section id="compare-table-section" className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-normal italic text-charcoal">
            Merchant Comparison Matrix
          </h2>
          <p className="text-xs text-smoke font-light mt-1">
            Real-time stock, pricing, and shipping fee indices.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E8D8CE] shadow-luxury-light">
          <table className="w-full border-collapse text-left text-sm font-sans">
            <thead>
              <tr className="bg-[#1C1410] text-[#FAF6F2] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Seller Info</th>
                <th className="p-4 font-semibold">Reliability Index</th>
                <th className="p-4 font-semibold">Delivery Estimate</th>
                <th className="p-4 font-semibold">Aggregated Fee</th>
                <th className="p-4 font-semibold">Base Price</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((listing) => {
                const isBest = listing.id === cheapestListing.id;
                return (
                  <tr 
                    key={listing.id}
                    className={`border-b border-[#E8D8CE] transition-colors last:border-0 ${
                      isBest 
                        ? "border-l-4 border-l-[#1D9E75] bg-[#E1F5EE] hover:bg-[#D4EFE6]" 
                        : "odd:bg-[#F5EDE4] even:bg-[#FAF6F2] hover:bg-[#F0E8DD]"
                    }`}
                  >
                    <td className="p-4 font-medium text-charcoal">
                      <div className="flex items-center gap-2">
                        {listing.sellerName}
                        {listing.isVerified && (
                          <ShieldCheck className="h-4 w-4 text-[#1D9E75]" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-smoke">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-current text-goldmist" />
                        <strong>{listing.rating.toFixed(1)}</strong>/5.0
                      </div>
                    </td>
                    <td className="p-4 text-smoke font-light">
                      Delivers in {listing.deliveryDays} days
                    </td>
                    <td className="p-4 text-smoke font-light">
                      {listing.deliveryFee > 0 ? `₹${listing.deliveryFee}` : "Free"}
                    </td>
                    <td className="p-4 font-semibold text-charcoal">
                      ₹{listing.price.toLocaleString("en-IN")}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={listing.shopUrl}
                        className="inline-flex items-center gap-1 bg-[#8B3A52] hover:bg-[#C4607A] text-[#FAF6F2] px-4 py-2 rounded text-xs font-semibold transition-colors uppercase tracking-wider"
                      >
                        Buy Now <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
