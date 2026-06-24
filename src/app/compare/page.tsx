"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Trash2 } from "lucide-react";
import { useCompareStore } from "@/store/compare.store";
import CompareTable from "@/components/compare/CompareTable";

export default function ComparePage() {
  const productIds = useCompareStore((state) => state.productIds);
  const clearCompare = useCompareStore((state) => state.clear);
  const [mounted, setMounted] = useState(false);
  const [compareProducts, setCompareProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (productIds.length === 0) {
      setCompareProducts([]);
      return;
    }

    const fetchComparisons = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds }),
        });
        if (response.ok) {
          const result = await response.json();
          setCompareProducts(result.data?.products || []);
        }
      } catch (error) {
        console.error("Failed to fetch product comparisons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisons();
  }, [productIds, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center items-center">
        <div className="animate-pulse flex flex-col items-center gap-4 w-full">
          <div className="h-8 w-48 bg-surface-container rounded" />
          <div className="h-64 w-full max-w-4xl bg-surface-container rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/30 pb-5 mb-8 gap-4">
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
            className="self-start sm:self-center flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-error transition-colors cursor-pointer"
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
