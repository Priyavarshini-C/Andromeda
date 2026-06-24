// =============================================================================
// Andromeda — User Shopping Cart Page
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Package,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useSession } from "next-auth/react";

interface CartProduct {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  price: number;
  original_price: number | null;
  discount_pct: number;
  currency: string;
  stock: number;
  brand: string | null;
  seller: { id: string; business_name: string; slug: string; is_verified: boolean };
  category: { id: string; name: string; slug: string };
}

interface CartItem {
  id: string;
  quantity: number;
  added_at: string;
  product: CartProduct;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchCart();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, fetchCart]);

  const updateQuantity = async (id: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, quantity: newQty } : item
          )
        );
      } else {
        const errData = await res.json();
        alert(errData.error?.message || "Failed to update quantity");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (id: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalDiscount = items.reduce((sum, item) => {
    if (item.product.original_price && item.product.original_price > item.product.price) {
      return sum + (item.product.original_price - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);
  const shipping = subtotal > 1000 || subtotal === 0 ? 0 : 99; // Free shipping over ₹1,000
  const tax = Math.round(subtotal * 0.18); // 18% GST estimate included
  const total = subtotal + shipping;

  // Not logged in
  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-bold text-primary">Sign in to view your Cart</h1>
        <p className="text-sm text-on-surface-variant max-w-sm">
          Save products to your cart and proceed to checkout securely.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-outline-variant text-primary px-6 py-2.5 text-sm font-bold hover:bg-surface-container transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Back button & Title */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue Shopping
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Shopping Cart
          </h1>
          {!loading && (
            <span className="inline-flex items-center rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-bold text-secondary">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        // Loading Skeleton
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl border border-outline-variant bg-surface-card animate-pulse"
              />
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="h-64 rounded-xl border border-outline-variant bg-surface-card animate-pulse" />
          </div>
        </div>
      ) : items.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface-card border border-outline-variant text-outline">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-on-surface-variant max-w-sm">
              Explore products from local and direct sellers and add them to your cart.
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
        // Cart Content Grid
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl border border-outline-variant bg-surface-card overflow-hidden transition-all hover:border-secondary/20"
              >
                {/* Image */}
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-lg bg-surface-container overflow-hidden border border-outline-variant/30">
                  {item.product.thumbnail_url ? (
                    <img
                      src={item.product.thumbnail_url}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-outline">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm font-semibold text-primary leading-snug line-clamp-1 hover:text-secondary transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updatingId === item.id}
                        className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mb-2">
                      {item.product.seller.is_verified && (
                        <ShieldCheck className="h-3 w-3 text-secondary" />
                      )}
                      <span>{item.product.seller.business_name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 gap-2 flex-wrap">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-outline-variant rounded-lg bg-surface overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={updatingId === item.id || item.quantity <= 1}
                        className="p-1.5 hover:bg-surface-container text-primary transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-primary min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={
                          updatingId === item.id ||
                          item.quantity >= item.product.stock
                        }
                        className="p-1.5 hover:bg-surface-container text-primary transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-primary">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-on-surface-variant font-medium">
                          {formatCurrency(item.product.price)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-outline-variant bg-surface-card space-y-4">
            <h3 className="text-base font-bold text-primary">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-on-surface-variant font-medium border-b border-outline-variant/30 pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-primary font-semibold">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Total Discount</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-primary font-semibold">
                  {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated GST (18%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold text-primary border-b border-outline-variant/30 pb-4">
              <span>Total Price</span>
              <span className="text-base font-extrabold text-secondary">
                {formatCurrency(total)}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary text-white py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-on-surface-variant font-medium">
                <Lock className="h-3 w-3 text-secondary" />
                <span>Secure Checkout powered by Supabase Auth</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
