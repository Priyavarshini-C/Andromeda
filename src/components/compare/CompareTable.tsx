"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Star, ExternalLink, Check, X } from "lucide-react";
import { Product } from "@/lib/utils/mock-data";
import PriceTag from "@/components/product/PriceTag";
import StockBadge from "@/components/product/StockBadge";
import { useCompareStore } from "@/store/compare.store";

interface CompareTableProps {
  products: Product[];
}

export default function CompareTable({ products }: CompareTableProps) {
  const removeProduct = useCompareStore((state) => state.remove);

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-outline-variant p-6">
        <ScaleIcon className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-4 text-sm font-semibold text-primary">No products selected</h3>
        <p className="mt-2 text-xs text-on-surface-variant max-w-xs mx-auto">
          Add products to the comparison from listing pages or product details.
        </p>
        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center justify-center bg-secondary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-secondary/90 transition-colors"
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
    <div className="w-full overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-observatory">
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr>
            {/* First column: empty or metadata label */}
            <th className="w-64 min-w-[200px] border-b border-outline-variant bg-slate-50 p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Product details
            </th>
            {products.map((product) => (
              <th
                key={product.id}
                className="min-w-[240px] border-b border-l border-outline-variant p-4 align-top"
              >
                <div className="relative flex flex-col h-full">
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Remove from compare"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Thumbnail */}
                  <div className="relative aspect-square w-24 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                    <Image
                      src={product.images[0]}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Title & Brand */}
                  <span className="mt-4 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {product.brand}
                  </span>
                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-1 text-sm font-semibold text-primary hover:text-secondary line-clamp-2 leading-snug"
                  >
                    {product.title}
                  </Link>

                  {/* Rating */}
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current text-tertiary" />
                    <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
                    <span className="text-xs text-on-surface-variant font-medium">({product.reviewCount})</span>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Prices Row */}
          <tr className="border-b border-outline-variant">
            <td className="bg-slate-50/50 p-4 text-sm font-bold text-primary">
              Best Starting Price
            </td>
            {products.map((product) => {
              const isWinner = product.price === lowestPrice;
              return (
                <td
                  key={product.id}
                  className={`border-l border-outline-variant p-4 align-middle ${
                    isWinner ? "bg-success/5" : ""
                  }`}
                >
                  <PriceTag price={product.price} listPrice={product.listPrice} size="md" />
                  {isWinner && (
                    <span className="mt-1.5 inline-flex items-center rounded-full bg-success px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                      Best Price
                    </span>
                  )}
                </td>
              );
            })}
          </tr>

          {/* Availability Row */}
          <tr className="border-b border-outline-variant">
            <td className="bg-slate-50/50 p-4 text-sm font-bold text-primary">
              Availability
            </td>
            {products.map((product) => (
              <td key={product.id} className="border-l border-outline-variant p-4 align-middle">
                <StockBadge stock={product.stock} />
              </td>
            ))}
          </tr>

          {/* Sellers comparison row */}
          <tr className="border-b border-outline-variant">
            <td className="bg-slate-50/50 p-4 text-sm font-bold text-primary align-top">
              Seller Options
            </td>
            {products.map((product) => (
              <td key={product.id} className="border-l border-outline-variant p-4 align-top">
                <div className="flex flex-col gap-2">
                  {product.sellers.map((listing) => (
                    <div
                      key={listing.sellerId}
                      className="flex items-center justify-between gap-2 border border-slate-100 rounded-lg p-2 text-xs bg-slate-25 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          {listing.sellerName}
                          {listing.isVerified && (
                            <Check className="h-3 w-3 text-secondary" />
                          )}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-medium">Delivers in {listing.deliveryDays}d</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-primary">₹{listing.price.toLocaleString("en-IN")}</span>
                        <Link
                          href={listing.shopUrl}
                          className="mt-0.5 text-[9px] font-bold text-secondary flex items-center gap-0.5 hover:underline"
                        >
                          Visit Store
                          <ExternalLink className="h-2 w-2" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </td>
            ))}
          </tr>

          {/* Specifications Header */}
          <tr>
            <td
              colSpan={products.length + 1}
              className="bg-primary p-3 text-xs font-bold uppercase tracking-wider text-white"
            >
              Technical Specifications
            </td>
          </tr>

          {/* Specification details rows */}
          {allSpecKeys.map((specKey, index) => (
            <tr
              key={specKey}
              className={`border-b border-outline-variant ${
                index % 2 === 0 ? "" : "bg-secondary-container/5"
              }`}
            >
              <td className="bg-slate-50/50 p-4 text-xs font-semibold text-slate-600">
                {specKey}
              </td>
              {products.map((product) => {
                const specValue = product.specs?.[specKey];
                return (
                  <td
                    key={product.id}
                    className="border-l border-outline-variant p-4 text-xs text-on-surface"
                  >
                    {specValue || <span className="text-slate-300">—</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Simple fallback icon
function ScaleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v17m0-17l4 4m-4-4L8 7m4 13l4-4m-4 4l-4-4"
      />
    </svg>
  );
}
