"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, Scale, Heart, Check, ShieldCheck, Truck, ShoppingCart } from "lucide-react";
import { Product, SellerListing } from "@/lib/utils/mock-data";
import PriceTag from "@/components/product/PriceTag";
import StockBadge from "@/components/product/StockBadge";
import { useCompareStore } from "@/store/compare.store";

interface ProductDetailsClientProps {
  product: Product;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const { id, title, brand, description, images, price, listPrice, rating, reviewCount, sellers, stock } = product;

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

  // Find the best price seller
  const lowestPrice = Math.min(...sellers.map((s) => s.price));

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
          <PriceTag price={price} listPrice={listPrice} size="lg" />
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
          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">
            Seller &amp; Price Comparison
          </h3>
          <div className="flex flex-col gap-3">
            {sellers.map((listing) => {
              const isBestPrice = listing.price === lowestPrice;
              return (
                <div
                  key={listing.sellerId}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-xl p-4 gap-4 transition-all hover:shadow-observatory ${
                    isBestPrice
                      ? "border-success/30 bg-success/2"
                      : "border-outline-variant bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Truck className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
                        {listing.sellerName}
                        {listing.isVerified && (
                          <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase text-secondary bg-secondary/10 px-1.5 py-0.2 rounded-full">
                            <ShieldCheck className="h-3 w-3 inline text-secondary fill-current" /> Verified
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        Rating: <strong className="text-slate-700">{listing.rating.toFixed(1)}/5.0</strong> · Delivery in {listing.deliveryDays} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    <div className="flex flex-col sm:items-end">
                      <span className="text-lg font-extrabold text-primary">
                        ₹{listing.price.toLocaleString("en-IN")}
                      </span>
                      {isBestPrice && (
                        <span className="inline-flex text-[9px] font-bold text-success uppercase tracking-wider mt-0.5">
                          Best Price Deal
                        </span>
                      )}
                    </div>

                    <a
                      href={listing.shopUrl}
                      className="flex items-center gap-1.5 bg-secondary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-secondary/90 transition-colors"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Visit Store
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
