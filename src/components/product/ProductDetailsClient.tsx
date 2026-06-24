"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Scale, Heart, Check, ShieldCheck, Truck, ShoppingCart, Store, Zap, TrendingDown, ExternalLink } from "lucide-react";
import PriceTag from "@/components/product/PriceTag";
import StockBadge from "@/components/product/StockBadge";
import { useCompareStore } from "@/store/compare.store";

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
  const { id, title, brand, description, images, listPrice, rating, reviewCount, sellers, stock } = product;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  const addCompare = useCompareStore((state) => state.add);
  const removeCompare = useCompareStore((state) => state.remove);
  const isCompared = useCompareStore((state) => state.isSelected(id));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCompareToggle = () => {
    if (isCompared) {
      removeCompare(id);
    } else {
      addCompare(id);
    }
  };

  // Find the overall lowest base price (for display at the top card)
  const lowestBasePrice = Math.min(...sellers.map((s) => s.price));

  // Find Cheapest (minimum total cost: price + deliveryFee)
  const cheapestListing = sellers.reduce((cheapest, current) => {
    const currentTotal = current.price + current.deliveryFee;
    const cheapestTotal = cheapest.price + cheapest.deliveryFee;
    return currentTotal < cheapestTotal ? current : cheapest;
  }, sellers[0]);

  // Find Fastest (minimum deliveryDays)
  const fastestListing = sellers.reduce((fastest, current) => {
    return current.deliveryDays < fastest.deliveryDays ? current : fastest;
  }, sellers[0]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      
      {/* Left: Image Gallery */}
      <div className="flex flex-col gap-4">
        {/* Main image preview */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-outline-variant bg-white shadow-observatory">
          <Image
            src={images[activeImageIndex]}
            alt={title}
            fill
            priority
            className="object-cover"
          />
        </div>
        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImageIndex(index)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all ${
                  activeImageIndex === index ? "border-secondary" : "border-outline-variant hover:border-slate-400"
                }`}
              >
                <Image
                  src={img}
                  alt={`${title} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Main Product Details */}
      <div className="flex flex-col">
        {/* Brand */}
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">
          {brand}
        </span>
        
        {/* Title */}
        <h1 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
          {title}
        </h1>

        {/* Rating Summary */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-center text-tertiary">
            <Star className="h-4.5 w-4.5 fill-current" />
          </div>
          <span className="text-sm font-bold text-slate-700">{rating.toFixed(1)}</span>
          <span className="text-sm text-on-surface-variant font-medium">({reviewCount} customer reviews)</span>
        </div>

        {/* Starting Price info */}
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-outline-variant flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Best Starting Price
          </span>
          <PriceTag price={lowestBasePrice} listPrice={listPrice} size="lg" />
          <div className="flex items-center gap-2 mt-1">
            <StockBadge stock={stock} />
            <span className="text-xs text-on-surface-variant font-medium">aggregate stock across all stores</span>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Product Overview
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex gap-3 flex-wrap">
          <button
            onClick={handleCompareToggle}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold border transition-all ${
              mounted && isCompared
                ? "bg-secondary/10 border-secondary text-secondary"
                : "bg-primary border-primary text-white hover:bg-primary-container"
            }`}
          >
            {mounted && isCompared ? (
              <>
                <Check className="h-4 w-4" />
                In Comparison List
              </>
            ) : (
              <>
                <Scale className="h-4 w-4" />
                Add to Compare
              </>
            )}
          </button>
          
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
              isSaved
                ? "text-red-500 border-red-200 bg-red-50"
                : "text-slate-400 border-outline-variant hover:text-slate-600 hover:bg-slate-50"
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Sellers & Price Comparison Matrix */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
              Seller &amp; Price Comparison
            </h3>
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded-full">
              Local vs Online
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {sellers.map((listing) => {
              const isCheapest = listing.price + listing.deliveryFee === cheapestListing.price + cheapestListing.deliveryFee;
              const isFastest = listing.deliveryDays === fastestListing.deliveryDays;
              const isLocal = listing.source === "local";
              
              let sourceBadge = null;
              let brandColorClass = "border-outline-variant bg-white";
              let iconColor = "text-secondary";
              let sourceIcon = <Truck className="h-5 w-5" />;
              
              if (listing.source === "amazon") {
                sourceBadge = (
                  <span className="inline-flex text-[9px] font-extrabold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">
                    Amazon
                  </span>
                );
                brandColorClass = "border-outline-variant/60 bg-amber-500/[0.02]";
                iconColor = "text-amber-500";
              } else if (listing.source === "flipkart") {
                sourceBadge = (
                  <span className="inline-flex text-[9px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                    Flipkart
                  </span>
                );
                brandColorClass = "border-outline-variant/60 bg-blue-500/[0.02]";
                iconColor = "text-blue-500";
              } else if (listing.source === "meesho") {
                sourceBadge = (
                  <span className="inline-flex text-[9px] font-extrabold uppercase tracking-wider text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded">
                    Meesho
                  </span>
                );
                brandColorClass = "border-outline-variant/60 bg-rose-500/[0.02]";
                iconColor = "text-rose-500";
              } else {
                sourceBadge = (
                  <span className="inline-flex text-[9px] font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Local Store
                  </span>
                );
                brandColorClass = "border-emerald-500/20 bg-emerald-500/[0.02]";
                iconColor = "text-emerald-600";
                sourceIcon = <Store className="h-5 w-5" />;
              }

              // Highlight if cheapest
              const cardBorder = isCheapest
                ? "border-emerald-500/40 shadow-observatory ring-1 ring-emerald-500/20"
                : "border-outline-variant";

              return (
                <div
                  key={listing.id || listing.sellerId}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-xl p-4 gap-4 transition-all hover:shadow-observatory ${brandColorClass} ${cardBorder}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container ${iconColor}`}>
                      {sourceIcon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary flex flex-wrap items-center gap-1.5">
                        {listing.sellerName}
                        {sourceBadge}
                        {listing.isVerified && isLocal && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase text-secondary bg-secondary/10 px-1.5 py-0.2 rounded-full">
                            <ShieldCheck className="h-3 w-3 inline text-secondary fill-current" /> Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                        <span>Rating: <strong className="text-slate-700">{listing.rating.toFixed(1)}/5.0</strong></span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Zap className={`h-3 w-3 ${isFastest ? "text-purple-500 fill-current" : "text-slate-400"}`} />
                          Delivery: <strong className="text-slate-700">
                            {listing.deliveryDays === 0
                              ? "Same Day (Instant)"
                              : listing.deliveryDays === 1
                              ? "1 Day (Tomorrow)"
                              : `${listing.deliveryDays} Days`}
                          </strong>
                        </span>
                        {listing.deliveryFee > 0 && (
                          <>
                            <span>·</span>
                            <span>Shipping: ₹{listing.deliveryFee}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-lg font-extrabold text-primary">
                        ₹{listing.price.toLocaleString("en-IN")}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-0.5 justify-end">
                        {isCheapest && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 uppercase tracking-wide">
                            <TrendingDown className="h-3 w-3" /> Cheapest Deal
                          </span>
                        )}
                        {isFastest && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] font-bold text-purple-600 uppercase tracking-wide">
                            <Zap className="h-3 w-3 fill-current" /> Fastest Delivery
                          </span>
                        )}
                      </div>
                    </div>

                    <a
                      href={listing.shopUrl}
                      target={isLocal ? "_self" : "_blank"}
                      rel={isLocal ? undefined : "noopener noreferrer"}
                      className="flex items-center gap-1.5 bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-secondary/90 transition-colors"
                    >
                      {isLocal ? (
                        <>
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Visit Store
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-3.5 w-3.5" />
                          Buy Online
                        </>
                      )}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
