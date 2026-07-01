// =============================================================================
// Andromeda — Premium Rose Gold Compare Table (Client Component)
// =============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Star, ExternalLink, Check, X, Sparkles, Scale } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/lib/utils/mock-data";
import { useCompareStore } from "@/store/compare.store";

interface CompareTableProps {
  products: Product[];
}

export default function CompareTable({ products }: CompareTableProps) {
  const removeProduct = useCompareStore((state) => state.remove);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-ivory rounded-xl border border-[#E8D8CE] p-6 flex flex-col items-center justify-center">
        <Scale className="h-10 w-10 text-smoke animate-pulse mb-3" />
        <h3 className="text-base font-semibold text-charcoal">No products selected</h3>
        <p className="mt-2 text-xs text-smoke max-w-xs mx-auto font-light leading-relaxed">
          Add products to the comparison board from search results or details pages to begin.
        </p>
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-[#8B3A52] text-[#FAF6F2] px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-[#C4607A] transition-colors"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  // Find unique specs across all compared products
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs || {})))
  );

  // Find lowest price to highlight the winner
  const lowestPrice = Math.min(...products.map((p) => p.price));

  return (
    <div className="space-y-8 w-full bg-[#FAF6F2] text-charcoal">
      
      {/* ── AI Compare Summary Card ── */}
      <div className="liquid-glass-strong rounded-xl p-6 bg-[#2E1F16] border-l-4 border-[#C07840] shadow-luxury-dark">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-[#C07840] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-sans font-semibold text-ivory tracking-wider uppercase mb-1">
              AI Calibration Report
            </h3>
            <p className="text-sm font-sans font-light italic leading-7 text-[#E8C99A]">
              We calibrated the specifications and pricing logs. The optimal choice for raw value is &ldquo;{products.reduce((prev, curr) => prev.price < curr.price ? prev : curr).title}&rdquo; starting at ₹{lowestPrice.toLocaleString("en-IN")}.
            </p>
          </div>
        </div>
      </div>

      {/* ── Compare Table Wrapper ── */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#E8D8CE] shadow-luxury-light bg-[#FAF6F2]">
        <table className="w-full table-fixed border-collapse text-left text-sm font-sans">
          <thead>
            <tr>
              {/* Sticky first column */}
              <th className="w-64 min-w-[200px] border-b border-[#E8D8CE] bg-[#FAF6F2] p-4 text-[10px] font-sans font-semibold uppercase tracking-[2px] text-[#8A7D76] sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                Product Specifications
              </th>
              {products.map((product, idx) => (
                <th
                  key={product.id}
                  className="min-w-[240px] border-b border-l border-[#E8D8CE] p-4 align-top bg-white"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                    className="relative flex flex-col h-full"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-[#8A7D76] hover:bg-[#F0E0D4] hover:text-[#8B3A52] transition-colors cursor-pointer"
                      title="Remove from compare"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    {/* Thumbnail */}
                    <div className="relative aspect-square w-20 overflow-hidden rounded-lg bg-white border border-[#E8D8CE] p-1">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-contain p-1"
                      />
                    </div>

                    {/* Title & Brand */}
                    <span className="mt-4 text-[9px] font-sans font-semibold uppercase tracking-wider text-[#8A7D76]">
                      {product.brand}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="mt-1 text-xs font-semibold text-charcoal hover:text-[#C4607A] line-clamp-2 leading-snug transition-colors"
                    >
                      {product.title}
                    </Link>

                    {/* Rating */}
                    <div className="mt-2 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-goldmist" />
                      <span className="text-xs font-semibold text-charcoal">{product.rating.toFixed(1)}</span>
                      <span className="text-xs text-smoke font-light">({product.reviewCount})</span>
                    </div>
                  </motion.div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            
            {/* Prices Row */}
            <tr className="border-b border-[#E8D8CE] odd:bg-[#F5EDE4] even:bg-[#FAF6F2]">
              <td className="sticky left-0 bg-inherit p-4 text-xs font-semibold text-[#8A7D76] uppercase tracking-wider z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-[#E8D8CE]/40">
                Starting Price
              </td>
              {products.map((product, idx) => {
                const isWinner = product.price === lowestPrice;
                return (
                  <td
                    key={product.id}
                    className={`border-l border-[#E8D8CE] p-4 align-middle bg-white ${
                      isWinner ? "bg-[#F0E0D4]/30" : ""
                    }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                      className="flex flex-col gap-1.5"
                    >
                      <span className={`text-lg font-bold ${isWinner ? "text-[#8B3A52]" : "text-[#C07840]"}`}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {isWinner && (
                        <span className="inline-flex items-center rounded-full bg-[#8B3A52] px-2 py-0.5 text-[9px] font-semibold text-[#FAF6F2] uppercase tracking-wider w-fit">
                          Best Price
                        </span>
                      )}
                    </motion.div>
                  </td>
                );
              })}
            </tr>

            {/* Availability Row */}
            <tr className="border-b border-[#E8D8CE] odd:bg-[#F5EDE4] even:bg-[#FAF6F2]">
              <td className="sticky left-0 bg-inherit p-4 text-xs font-semibold text-[#8A7D76] uppercase tracking-wider z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-[#E8D8CE]/40">
                Availability
              </td>
              {products.map((product, idx) => (
                <td key={product.id} className="border-l border-[#E8D8CE] p-4 align-middle bg-white">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                  >
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                      product.stock > 0 ? "bg-[#E1F5EE] text-[#085041]" : "bg-[#F0E0D4] text-[#8B3A52]"
                    }`}>
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </motion.div>
                </td>
              ))}
            </tr>

            {/* Sellers options row */}
            <tr className="border-b border-[#E8D8CE] odd:bg-[#F5EDE4] even:bg-[#FAF6F2]">
              <td className="sticky left-0 bg-inherit p-4 text-xs font-semibold text-[#8A7D76] uppercase tracking-wider z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-[#E8D8CE]/40">
                Seller Options
              </td>
              {products.map((product, idx) => (
                <td key={product.id} className="border-l border-[#E8D8CE] p-4 align-top bg-white">
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                    className="flex flex-col gap-2"
                  >
                    {product.sellers.map((listing) => (
                      <div
                        key={listing.sellerId}
                        className="flex items-center justify-between gap-2 border border-[#E8D8CE] rounded p-2 text-xs bg-[#FAF6F2] hover:border-[#C07840] transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-charcoal flex items-center gap-0.5">
                            {listing.sellerName}
                            {listing.isVerified && (
                              <Check className="h-3 w-3 text-[#1D9E75]" />
                            )}
                          </span>
                          <span className="text-[10px] text-smoke">Delivers in {listing.deliveryDays}d</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-[#C07840]">₹{listing.price.toLocaleString("en-IN")}</span>
                          <Link
                            href={listing.shopUrl}
                            className="mt-0.5 text-[9px] font-semibold text-[#C4607A] flex items-center gap-0.5 hover:underline"
                          >
                            Visit Store
                            <ExternalLink className="h-2 w-2" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                </td>
              ))}
            </tr>

            {/* Specifications Row Separation Header */}
            <tr className="bg-[#1C1410] text-[#FAF6F2]">
              <td
                colSpan={products.length + 1}
                className="p-3 text-[10px] font-semibold uppercase tracking-[2px] text-goldmist"
              >
                Technical Specifications Index
              </td>
            </tr>

            {/* Specification details rows */}
            {allSpecKeys.map((specKey, rowIdx) => (
              <tr
                key={specKey}
                className="border-b border-[#E8D8CE] odd:bg-[#F5EDE4] even:bg-[#FAF6F2]"
              >
                <td className="sticky left-0 bg-inherit p-4 text-xs font-semibold text-[#8A7D76] uppercase tracking-wider z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-[#E8D8CE]/40">
                  {specKey}
                </td>
                {products.map((product, colIdx) => {
                  const specValue = product.specs?.[specKey];
                  return (
                    <td
                      key={product.id}
                      className="border-l border-[#E8D8CE] p-4 text-xs text-charcoal bg-white"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: colIdx * 0.1, ease: "easeOut" }}
                      >
                        {specValue ? (
                          specValue.toLowerCase() === "yes" || specValue.toLowerCase() === "true" ? (
                            <Check className="h-4.5 w-4.5 text-[#1D9E75]" />
                          ) : specValue.toLowerCase() === "no" || specValue.toLowerCase() === "false" ? (
                            <X className="h-4.5 w-4.5 text-[#C4607A]" />
                          ) : (
                            specValue
                          )
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
