// =============================================================================
// Andromeda — Premium Rose Gold Product Card Component
// =============================================================================

"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Scale, Heart, Check, ArrowRight } from "lucide-react";
import { Product } from "@/lib/utils/mock-data";
import { useCompareStore } from "@/store/compare.store";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
    setTimeout(() => setMounted(true), 0);
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
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(14,10,9,0.12)", borderColor: "#C07840" }}
      className="group relative flex flex-col overflow-hidden rounded-[12px] border border-[#E8D8CE] bg-[#FAF6F2] transition-all duration-300 w-full"
    >
      {/* Product Image Link Container */}
      <Link href={`/products/${slug}`} className="relative block aspect-square w-full overflow-hidden bg-white">
        <Image
          src={images[0]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Save/Heart Button Overlay */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border bg-white shadow-sm transition-colors cursor-pointer ${
            isSaved 
              ? "text-[#C4607A] border-[#E8D8CE]" 
              : "text-[#8A7D76] border-[#E8D8CE] hover:text-[#C4607A]"
          }`}
          aria-label="Save to Wishlist"
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
        </button>

        {/* Floating Discount Tag */}
        {discountPercent > 0 && (
          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-[#8B3A52] px-2 py-0.5 text-[9px] font-bold text-[#FAF6F2] uppercase tracking-wider">
            {discountPercent}% OFF
          </div>
        )}
      </Link>

      {/* Card Details */}
      <div className="flex flex-col flex-1 p-4 bg-[#FAF6F2]">
        
        {/* Brand & Category Row */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-sans font-light tracking-[2px] uppercase text-[#8A7D76]">
            {brand}
          </span>
          <span className="bg-[#F0E0D4] text-[#8B3A52] text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full tracking-wider">
            Atelier
          </span>
        </div>

        {/* Title */}
        <Link href={`/products/${slug}`} className="mt-2 block hover:text-[#C4607A] transition-colors">
          <h3 className="text-sm font-semibold text-[#1C1410] line-clamp-2 h-10 leading-5">
            {title}
          </h3>
        </Link>

        {/* Ratings */}
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3 w-3 fill-current text-goldmist" />
          <span className="text-xs font-semibold text-[#1C1410]">{rating.toFixed(1)}</span>
          <span className="text-xs text-[#8A7D76] font-light">({reviewCount})</span>
        </div>

        {/* Pricing Info */}
        <div className="mt-4 pt-3 border-t border-[#E8D8CE] flex flex-col gap-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-xl font-bold text-[#C07840]">
              ₹{price.toLocaleString("en-IN")}
            </span>
            {listPrice && listPrice > price && (
              <span className="text-xs text-[#8A7D76] line-through">
                ₹{listPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center text-[11px] text-[#8A7D76]">
            <span>Seller: <strong className="font-medium text-[#1C1410]">{primarySeller?.sellerName}</strong></span>
            {primarySeller?.isVerified && (
              <span className="text-[9px] text-[#1D9E75] font-semibold uppercase tracking-wider">
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 pt-2">
          {/* Compare Toggle */}
          <button
            onClick={handleCompareClick}
            className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded text-xs font-semibold border transition-all cursor-pointer ${
              mounted && isCompared
                ? "bg-[#8B3A52]/10 border-[#8B3A52] text-[#8B3A52]"
                : "bg-white border-[#E8D8CE] text-[#1C1410] hover:bg-[#FAF6F2] hover:border-[#C4607A]"
            }`}
          >
            {mounted && isCompared ? (
              <>
                <Check className="h-3 w-3" />
                Added
              </>
            ) : (
              <>
                <Scale className="h-3 w-3" />
                Compare
              </>
            )}
          </button>

          {/* Compare Prices Link */}
          <Link
            href={`/products/${slug}`}
            className="flex h-9 px-3 items-center justify-center bg-white border border-[#E8D8CE] hover:border-[#C4607A] text-[#C4607A] hover:bg-[#FAF6F2] rounded text-xs font-semibold transition-colors"
          >
            Compare Prices <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
