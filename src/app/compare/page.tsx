"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Trash2 } from "lucide-react";
import { useCompareStore } from "@/store/compare.store";
import { PRODUCTS } from "@/lib/utils/mock-data";
import CompareTable from "@/components/compare/CompareTable";

export default function ComparePage() {
  const productIds = useCompareStore((state) => state.productIds);
  const clearCompare = useCompareStore((state) => state.clear);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-64 w-full max-w-xl bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  // Resolve products from the store IDs
  const compareProducts = PRODUCTS.filter((p) => productIds.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Compare Products
            </h1>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {compareProducts.length}/4 selected
            </span>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant font-medium">
            Side-by-side evaluation of technical specifications, stock status, and seller pricing matrices.
          </p>
        </div>

        {compareProducts.length > 0 && (
          <button
            onClick={clearCompare}
            className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Clear Comparison
          </button>
        )}
      </div>

      {/* Main Compare Matrix */}
      <div className="flex-1">
        <CompareTable products={compareProducts} />
      </div>
    </div>
  );
}
