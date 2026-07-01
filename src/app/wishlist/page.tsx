// =============================================================================
// Andromeda — Premium Wishlist & Alerts Page (Rose Gold Overhaul)
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import LinkComponent from "next/link";
import { Heart, Star, ShieldCheck, Trash2, Scale, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCompareStore } from "@/store/compare.store";
import Image from "next/image";
import { motion } from "framer-motion";

interface WishlistProduct {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  original_price: number | null;
  discount_pct: number;
  currency: string;
  stock: number;
  rating: number;
  review_count: number;
  brand: string | null;
  is_featured: boolean;
  seller: { id: string; business_name: string; slug: string; is_verified: boolean };
  category: { id: string; name: string; slug: string };
}

interface WishlistItem {
  id: string;
  collection_name: string;
  note: string | null;
  added_at: string;
  product: WishlistProduct;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function WishlistCard({
  item,
  onRemove,
}: {
  item: WishlistItem;
  onRemove: (id: string) => void;
}) {
  const addToCompare = useCompareStore((s) => s.add);
  const compareIds = useCompareStore((s) => s.productIds);
  const isInCompare = compareIds.includes(item.product.id);
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/user/wishlist/${item.id}`, { method: "DELETE" });
      if (res.ok) onRemove(item.id);
    } finally {
      setRemoving(false);
    }
  };

  const hasDropped = item.product.original_price && item.product.original_price > item.product.price;

  return (
    <motion.div 
      whileHover={{ y: -4, boxShadow: "0 8px 24px rgba(14,10,9,0.06)", borderColor: "#C07840" }}
      className="group relative flex flex-col overflow-hidden rounded-[12px] border border-[#E8D8CE] bg-ivory transition-all duration-300 w-full"
    >
      {/* Product Image Link */}
      <LinkComponent href={`/products/${item.product.slug}`} className="block relative aspect-square bg-white border-b border-[#E8D8CE] p-4">
        {item.product.thumbnail_url ? (
          <Image
            src={item.product.thumbnail_url}
            alt={item.product.title}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#E8D8CE]">
            <Package className="h-12 w-12" />
          </div>
        )}

        {/* Change Badge */}
        {hasDropped ? (
          <span className="absolute top-3 left-3 bg-[#E1F5EE] text-[#085041] text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Price Dropped
          </span>
        ) : item.product.discount_pct > 0 ? (
          <span className="absolute top-3 left-3 bg-[#F0E0D4] text-[#8B3A52] text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Price Risen
          </span>
        ) : null}
      </LinkComponent>

      {/* Card Details */}
      <div className="p-4 flex flex-col flex-1 bg-ivory">
        
        <div className="flex items-start justify-between gap-2 mb-2">
          <LinkComponent href={`/products/${item.product.slug}`} className="flex-grow">
            <h3 className="text-sm font-semibold text-charcoal leading-snug line-clamp-2 hover:text-[#C4607A] transition-colors">
              {item.product.title}
            </h3>
          </LinkComponent>
          
          <button
            onClick={handleRemove}
            disabled={removing}
            className="shrink-0 p-1.5 rounded-full text-smoke hover:text-[#C4607A] hover:bg-parchment transition-colors cursor-pointer disabled:opacity-50"
            title="Remove from wishlist"
          >
            {removing ? (
              <span className="h-4 w-4 border-2 border-[#C4607A] border-t-transparent rounded-full animate-spin block" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {item.product.brand && (
          <p className="text-[10px] font-semibold text-smoke uppercase tracking-wider mb-2">
            {item.product.brand}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-3.5 w-3.5 text-goldmist fill-current" />
          <span className="text-xs font-semibold text-charcoal">{item.product.rating.toFixed(1)}</span>
          <span className="text-xs text-smoke font-light">({item.product.review_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-lg font-bold text-[#C07840]">{formatCurrency(item.product.price)}</span>
          {item.product.original_price && item.product.original_price > item.product.price && (
            <span className="text-xs text-smoke line-through">
              {formatCurrency(item.product.original_price)}
            </span>
          )}
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1 text-[11px] text-[#8A7D76] mb-3">
          {item.product.seller.is_verified && <ShieldCheck className="h-3.5 w-3.5 text-[#1D9E75]" />}
          <span className="font-medium text-charcoal">{item.product.seller.business_name}</span>
        </div>

        {/* Stock */}
        <div className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${
          item.product.stock > 5 ? "text-[#1D9E75]" : item.product.stock > 0 ? "text-[#C07840]" : "text-[#8B3A52]"
        }`}>
          {item.product.stock > 5 ? "In Stock" : item.product.stock > 0 ? `Only ${item.product.stock} left` : "Out of Stock"}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2 border-t border-[#E8D8CE]">
          <LinkComponent
            href={`/products/${item.product.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 rounded bg-[#8B3A52] hover:bg-[#C4607A] text-[#FAF6F2] py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            View Deal
          </LinkComponent>
          
          <button
            onClick={() => !isInCompare && addToCompare(item.product.id)}
            disabled={isInCompare}
            className={`flex items-center justify-center gap-1.5 rounded border px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
              isInCompare
                ? "border-[#8B3A52] bg-[#8B3A52]/10 text-[#8B3A52]"
                : "border-[#E8D8CE] text-smoke hover:border-[#C4607A] hover:text-[#C4607A]"
            }`}
            title={isInCompare ? "In compare" : "Add to compare"}
          >
            <Scale className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/wishlist");
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      setTimeout(() => fetchWishlist(), 0);
    } else if (status === "unauthenticated") {
      setTimeout(() => setLoading(false), 0);
    }
  }, [status, fetchWishlist]);

  const handleRemove = (wishlistId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== wishlistId));
  };

  // Not logged in empty state
  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center gap-6 bg-[#FAF6F2] text-charcoal">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0E0D4] text-[#8B3A52]">
          <Heart className="h-10 w-10 fill-current" />
        </div>
        <h1 className="text-2xl font-semibold text-charcoal">Sign in to view your Wishlist</h1>
        <p className="text-sm text-smoke max-w-sm font-light leading-relaxed">
          Save products you love, track historical pricing drops, and compare side-by-side.
        </p>
        <div className="flex gap-4">
          <LinkComponent href="/login" className="rounded bg-[#8B3A52] text-[#FAF6F2] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C4607A] transition-colors">
            Sign In
          </LinkComponent>
          <LinkComponent href="/register" className="rounded border border-[#E8D8CE] text-[#8B3A52] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#F5EDE4] transition-colors">
            Create Account
          </LinkComponent>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 bg-[#FAF6F2] text-charcoal">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#E8D8CE] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-sans font-medium text-charcoal">My Wishlist</h1>
            {!loading && (
              <span className="inline-flex items-center rounded-full bg-[#8B3A52] px-2.5 py-0.5 text-xs font-bold text-white">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-smoke font-light">
            Products you&apos;ve saved for later — track pricing variations and compare before buying.
          </p>
        </div>
        
        {items.length > 1 && (
          <LinkComponent
            href="/compare"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#C4607A] hover:underline"
          >
            <Scale className="h-4 w-4" />
            Compare All
          </LinkComponent>
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-[#E8D8CE] bg-white overflow-hidden animate-pulse">
              <div className="aspect-square bg-zinc-200" />
              <div className="p-4 space-y-2 bg-ivory">
                <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                <div className="h-3 w-1/2 bg-zinc-200 rounded" />
                <div className="h-5 w-1/3 bg-zinc-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty state with line-art SVG */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white border border-[#E8D8CE] text-[#E8D8CE]">
            <Heart className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-smoke max-w-sm font-light">
              Browse products and click the heart icon to save them here for later.
            </p>
          </div>
          <LinkComponent
            href="/products"
            className="inline-flex items-center gap-2 rounded bg-[#8B3A52] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C4607A] transition-colors"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </LinkComponent>
        </div>
      ) : (
        /* Grid of items */
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
