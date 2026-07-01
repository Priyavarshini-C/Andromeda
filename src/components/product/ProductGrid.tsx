// =============================================================================
// Andromeda — Premium Product Grid
// =============================================================================

import React from "react";
import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/utils/mock-data";

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  emptyMessage = "No products cataloged matching these filters."
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-[12px] bg-ivory border border-dashed border-[#E8D8CE] w-full">
        {/* SVG line-art empty state illustration */}
        <svg 
          className="h-16 w-16 text-[#E8D8CE] mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1} 
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
          />
        </svg>
        <p className="text-sm font-sans font-medium text-charcoal">{emptyMessage}</p>
        <p className="text-xs text-smoke mt-1 max-w-xs leading-relaxed">
          Try adjusting your filter handles, clearing all, or searching for other items.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
