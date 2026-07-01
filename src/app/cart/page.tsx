// =============================================================================
// Andromeda — Shopping Cart Page (Rose Gold Overhaul)
// =============================================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  ShieldCheck, Package, ArrowLeft, Lock 
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";

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
    if (status === "authenticated") {
      setTimeout(() => fetchCart(), 0);
    } else if (status === "unauthenticated") {
      setTimeout(() => setLoading(false), 0);
    }
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
  const total = subtotal + shipping;

  // Not logged in empty state
  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center gap-6 bg-[#FAF6F2] text-charcoal">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F0E0D4] text-[#8B3A52]">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-semibold text-charcoal">Sign in to view your Cart</h1>
        <p className="text-sm text-smoke max-w-sm font-light leading-relaxed">
          Calibrate your order items and proceed to secure checkout.
        </p>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded bg-[#8B3A52] text-[#FAF6F2] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C4607A] transition-colors cursor-pointer"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded border border-[#E8D8CE] text-[#8B3A52] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#FAF6F2] transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 bg-[#FAF6F2] text-charcoal">
      
      {/* Back button & Title */}
      <div className="mb-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C4607A] hover:underline mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue Shopping
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-sans font-medium text-charcoal">
            Shopping Cart
          </h1>
          {!loading && (
            <span className="inline-flex items-center rounded-full bg-[#8B3A52] px-2.5 py-0.5 text-xs font-bold text-white">
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
                className="h-28 rounded-[12px] border border-[#E8D8CE] bg-white animate-pulse"
              />
            ))}
          </div>
          <div className="lg:col-span-4">
            <div className="h-64 rounded-[12px] border border-[#E8D8CE] bg-white animate-pulse" />
          </div>
        </div>
      ) : items.length === 0 ? (
        // Empty State with SVG line-art
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white border border-[#E8D8CE] text-[#E8D8CE]">
            <ShoppingBag className="h-12 w-12" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal mb-2">
              Your cart is empty
            </h2>
            <p className="text-sm text-smoke font-light">
              Explore products from local and direct sellers and add them to your cart.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded bg-[#8B3A52] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C4607A] transition-colors"
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
              <motion.div
                key={item.id}
                whileHover={{ y: -1, borderColor: "#C07840" }}
                className="flex gap-4 p-5 rounded-[12px] border border-[#E8D8CE] bg-ivory overflow-hidden transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-[8px] bg-white overflow-hidden border border-[#E8D8CE] p-1">
                  {item.product.thumbnail_url ? (
                    <Image
                      src={item.product.thumbnail_url}
                      alt={item.product.title}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#E8D8CE]">
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
                        className="text-sm font-semibold text-charcoal leading-snug line-clamp-1 hover:text-[#C4607A] transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updatingId === item.id}
                        className="p-1.5 rounded-full text-smoke hover:text-[#C4607A] hover:bg-parchment transition-colors disabled:opacity-50 cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#8A7D76] mb-2 font-light">
                      {item.product.seller.is_verified && (
                        <ShieldCheck className="h-3.5 w-3.5 text-[#1D9E75]" />
                      )}
                      <span>{item.product.seller.business_name}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 gap-2 flex-wrap pt-2 border-t border-[#E8D8CE]/40">
                    
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-[#E8D8CE] rounded-[8px] bg-white overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={updatingId === item.id || item.quantity <= 1}
                        className="p-1.5 hover:bg-[#F0E0D4] text-[#8B3A52] transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-charcoal min-w-[24px] text-center">
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
                        className="p-1.5 hover:bg-[#F0E0D4] text-[#8B3A52] transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#C07840]">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-smoke font-light">
                          {formatCurrency(item.product.price)} each
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 p-6 rounded-[12px] border border-[#E8D8CE] bg-ivory space-y-5 shadow-luxury-light">
            <h3 className="text-sm font-semibold uppercase tracking-[2px] text-charcoal border-b border-[#E8D8CE] pb-3">
              Order Summary
            </h3>

            <div className="space-y-3.5 text-xs text-smoke font-light border-b border-[#E8D8CE] pb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-charcoal font-semibold">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-[#1D9E75] font-medium">
                  <span>Discount Savings</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-charcoal font-semibold">
                  {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                </span>
              </div>
            </div>

            <div className="flex justify-between text-sm font-bold border-b border-[#E8D8CE] pb-4">
              <span className="text-[#1C1410]">Total Price</span>
              <span className="text-base font-bold text-[#C07840]">
                {formatCurrency(total)}
              </span>
            </div>

            {/* Secure Checkout CTA */}
            <div className="space-y-4 pt-2">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#8B3A52] hover:bg-[#C4607A] text-[#FAF6F2] py-3 text-xs font-semibold uppercase tracking-wider transition-colors shadow-luxury-light"
              >
                Proceed to Checkout →
              </Link>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8A7D76] font-medium">
                <Lock className="h-3.5 w-3.5 text-[#C07840]" />
                <span>SSL Secured Checkout Platform</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
