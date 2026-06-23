"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Scale, Heart, Check } from "lucide-react";
import { Product, SellerListing } from "@/lib/utils/mock-data";
import PriceTag from "@/components/product/PriceTag";
import { useCompareStore } from "@/store/compare.store";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, title, brand, slug, images, price, listPrice, rating, reviewCount, sellers } = product;

  const addCompare = useCompareStore((state) => state.add);
  const removeCompare = useCompareStore((state) => state.remove);
  const isCompared = useCompareStore((state) => state.isSelected(id));

  const [mounted, setMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeCompare(id);
    } else {
      addCompare(id);
    }
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  // Find lowest price seller or fallback
  const primarySeller = sellers.reduce((lowest, current) => 
    current.price < lowest.price ? current : lowest
  , sellers[0]);

  const discountPercent = listPrice && listPrice > price
    ? Math.round(((listPrice - price) / listPrice) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-observatory-lifted">
      {/* Product Image Link Container */}
      <Link href={`/products/${slug}`} className="relative block aspect-square w-full overflow-hidden bg-slate-50">
        <Image
          src={images[0]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Save/Heart Button Overlay */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-sm transition-colors ${
            isSaved 
              ? "text-red-500 border-red-200 bg-red-50" 
              : "text-slate-400 border-slate-100 hover:text-slate-600 hover:bg-slate-50"
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`h-4.5 w-4.5 ${isSaved ? "fill-current" : ""}`} />
        </button>

        {/* Floating Discount Tag */}
        {discountPercent > 0 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 rounded-full bg-tertiary px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            {discountPercent}% OFF
          </div>
        )}
      </Link>

      {/* Card Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80">
          {brand}
        </span>

        {/* Title */}
        <Link href={`/products/${slug}`} className="mt-1 block group-hover:text-secondary">
          <h3 className="text-sm font-semibold text-primary line-clamp-2 h-10 leading-5">
            {title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center text-tertiary">
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
          <span className="text-xs font-bold text-slate-700">{rating.toFixed(1)}</span>
          <span className="text-xs text-on-surface-variant font-medium">({reviewCount} reviews)</span>
        </div>

        {/* Pricing Info */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-1">
          <PriceTag price={price} listPrice={listPrice} size="sm" />
          <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
            <span>Sold by: <strong className="font-semibold text-slate-700">{primarySeller?.sellerName}</strong></span>
            {primarySeller?.isVerified && (
              <span className="inline-flex items-center rounded-full bg-primary-container/10 px-1.5 py-0.2 text-[8px] font-bold text-primary-container uppercase">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCompareClick}
            className={`flex-1 flex items-center justify-center gap-1.5 h-8.5 rounded-lg text-xs font-bold border transition-all ${
              mounted && isCompared
                ? "bg-secondary/10 border-secondary text-secondary"
                : "bg-white border-outline-variant text-slate-700 hover:bg-slate-50 hover:border-slate-400"
            }`}
          >
            {mounted && isCompared ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added
              </>
            ) : (
              <>
                <Scale className="h-3.5 w-3.5" />
                Compare
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
