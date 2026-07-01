"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { X, Scale, ArrowRight } from "lucide-react";
import { useCompareStore } from "@/store/compare.store";
import { PRODUCTS } from "@/lib/utils/mock-data";

export default function CompareBar() {
  const productIds = useCompareStore((state) => state.productIds);
  const removeProduct = useCompareStore((state) => state.remove);
  const clearCompare = useCompareStore((state) => state.clear);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (!mounted || productIds.length === 0) return null;

  // Resolve matching product info from the IDs
  const compareProducts = PRODUCTS.filter((p) => productIds.includes(p.id));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-outline-variant shadow-[0_-8px_30px_rgb(15,45,90,0.08)] transition-transform duration-300 transform translate-y-0">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Left info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/10 text-primary">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">Compare Products</p>
              <p className="text-xs text-on-surface-variant font-medium">
                Select up to 4 items to evaluate side by side
              </p>
            </div>
          </div>

          {/* Selected items list */}
          <div className="flex flex-wrap items-center gap-3">
            {compareProducts.map((product) => (
              <div
                key={product.id}
                className="group relative flex items-center gap-2 rounded-lg border border-outline-variant bg-white p-1.5 pr-8 shadow-sm transition-all"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded bg-slate-50">
                  <Image
                    src={product.images[0]}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="max-w-[120px] text-xs font-semibold text-primary truncate">
                  {product.title}
                </div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Empty slots placeholders */}
            {Array.from({ length: Math.max(0, 4 - compareProducts.length) }).map((_, i) => (
              <div
                key={i}
                className="hidden sm:flex h-[52px] w-36 items-center justify-center rounded-lg border border-dashed border-slate-200 text-[10px] font-medium text-slate-400 bg-slate-25"
              >
                Empty Slot
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={clearCompare}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Clear All
            </button>
            <Link
              href="/compare"
              className="flex items-center gap-1.5 bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-secondary/90 transition-all hover:gap-2"
            >
              Compare Now ({compareProducts.length}/4)
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
