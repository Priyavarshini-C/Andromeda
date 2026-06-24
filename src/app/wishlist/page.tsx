// =============================================================================
// Andromeda — Wishlist Page
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, Star, ShieldCheck, Trash2, Scale, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useSession } from "next-auth/react";
import { useCompareStore } from "@/store/compare.store";
import Image from "next/image";

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

  return (
    <div className="group bg-surface-card rounded-xl border border-outline-variant shadow-observatory hover:shadow-observatory-lifted hover:border-secondary/20 transition-all overflow-hidden">
      {/* Product Image */}
      <Link href={`/products/${item.product.slug}`} className="block relative aspect-square bg-surface-container">
        {item.product.thumbnail_url ? (
          <img
            src={item.product.thumbnail_url}
            alt={item.product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-outline">
            <Package className="h-12 w-12" />
          </div>
        )}
        {item.product.discount_pct > 0 && (
          <span className="absolute top-2 left-2 bg-success text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{item.product.discount_pct}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/products/${item.product.slug}`} className="flex-1">
            <h3 className="text-sm font-semibold text-primary leading-snug line-clamp-2 hover:text-secondary transition-colors">
              {item.product.title}
            </h3>
          </Link>
          <button
            onClick={handleRemove}
            disabled={removing}
            className="shrink-0 p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors cursor-pointer disabled:opacity-50"
            title="Remove from wishlist"
          >
            {removing ? (
              <span className="h-4 w-4 border-2 border-outline border-t-error rounded-full animate-spin block" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>

        {item.product.brand && (
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
            {item.product.brand}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-3.5 w-3.5 text-tertiary fill-tertiary" />
          <span className="text-xs font-bold text-on-surface">{item.product.rating.toFixed(1)}</span>
          <span className="text-[11px] text-on-surface-variant">({item.product.review_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-base font-extrabold text-primary">{formatCurrency(item.product.price)}</span>
          {item.product.original_price && item.product.original_price > item.product.price && (
            <span className="text-xs text-on-surface-variant line-through">
              {formatCurrency(item.product.original_price)}
            </span>
          )}
        </div>

        {/* Seller */}
        <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mb-3">
          {item.product.seller.is_verified && <ShieldCheck className="h-3 w-3 text-secondary" />}
          <span className="font-medium">{item.product.seller.business_name}</span>
        </div>

        {/* Stock */}
        <div className={`text-[10px] font-bold uppercase tracking-wider mb-3 ${
          item.product.stock > 5 ? "text-success" : item.product.stock > 0 ? "text-tertiary" : "text-error"
        }`}>
          {item.product.stock > 5 ? "In Stock" : item.product.stock > 0 ? `Only ${item.product.stock} left` : "Out of Stock"}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/products/${item.product.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary text-white py-2 text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            View Deal
          </Link>
          <button
            onClick={() => !isInCompare && addToCompare(item.product.id)}
            disabled={isInCompare}
            className={`flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors cursor-pointer ${
              isInCompare
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-outline-variant text-on-surface-variant hover:border-secondary hover:text-secondary"
            }`}
            title={isInCompare ? "In compare" : "Add to compare"}
          >
            <Scale className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
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
    if (status === "authenticated") fetchWishlist();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, fetchWishlist]);

  const handleRemove = (wishlistId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== wishlistId));
  };

  // Not logged in
  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Heart className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-primary">Sign in to view your Wishlist</h1>
        <p className="text-sm text-on-surface-variant max-w-sm">
          Save products you love and track prices, all in one place.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity">
            Sign In
          </Link>
          <Link href="/register" className="rounded-lg border border-outline-variant text-primary px-6 py-2.5 text-sm font-bold hover:bg-surface-container transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-outline-variant/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">My Wishlist</h1>
            {!loading && (
              <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-on-surface-variant font-medium">
            Products you&apos;ve saved for later — track prices and compare before buying.
          </p>
        </div>
        {items.length > 1 && (
          <Link
            href="/compare"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline"
          >
            <Scale className="h-4 w-4" />
            Compare All
          </Link>
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-outline-variant bg-surface-card overflow-hidden animate-pulse">
              <div className="aspect-square bg-surface-container" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-surface-container rounded" />
                <div className="h-3 w-1/2 bg-surface-container rounded" />
                <div className="h-5 w-1/3 bg-surface-container rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-card border border-outline-variant text-outline">
            <Heart className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-on-surface-variant max-w-sm">
              Browse products and click the heart icon to save them here for later.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Explore Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        /* Grid of items */
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <WishlistCard key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
