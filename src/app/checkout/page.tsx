// =============================================================================
// Andromeda — Premium Secure Checkout & Order Success Page (Rose Gold Overhaul)
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft, CheckCircle, CreditCard, Home, Loader2,
  Lock, MapPin, Phone, ShieldCheck, ShoppingBag, User, Check
} from "lucide-react";
import { motion } from "framer-motion";

interface CartProduct {
  id: string;
  title: string;
  price: number;
  original_price: number | null;
  currency: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Chandigarh"
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);

  // Shipping details state
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "Karnataka",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data.data || []);
        if ((data.data || []).length === 0) {
          router.push("/cart");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      setTimeout(() => {
        fetchCart();
      }, 0);
    }
  }, [status, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: {
            name: shipping.name,
            phone: shipping.phone,
            addressLine1: shipping.addressLine1,
            city: shipping.city,
            state: shipping.state,
            pincode: shipping.pincode,
          },
          paymentMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlacedOrderIds(data.data?.orderIds || []);
        setOrderSuccess(true);
      } else {
        const errData = await res.json();
        alert(errData.error?.message || "Failed to place order. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Checkout error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCharge = subtotal > 1000 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shippingCharge;

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center bg-[#FAF6F2] text-charcoal">
        <Loader2 className="h-10 w-10 animate-spin text-[#8B3A52] mb-3" />
        <p className="text-xs text-smoke font-light tracking-wider uppercase">
          Verifying checkout authorization...
        </p>
      </div>
    );
  }

  // ── PAGE 12: ORDER CONFIRMATION VIEW (SUCCESS STATE) ──
  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8 text-center bg-[#FAF6F2] text-charcoal flex-grow">
        
        {/* Animated Checkmark Circle */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#1D9E75] bg-[#E1F5EE] text-[#1D9E75] mx-auto mb-6"
        >
          <Check className="h-10 w-10 stroke-[3]" />
        </motion.div>

        <h1 className="text-3xl font-bold tracking-tight text-charcoal">
          Order Placed!
        </h1>
        <p className="mt-2 text-sm text-smoke font-light max-w-md mx-auto leading-relaxed">
          Your order has been registered with the local ateliers and is pending prompt dispatch.
        </p>

        {/* Order Details Card */}
        <div className="w-full rounded-xl border border-[#E8D8CE] bg-ivory p-6 text-left text-xs space-y-4 my-8 shadow-luxury-light">
          <p className="font-semibold uppercase tracking-wider text-charcoal border-b border-[#E8D8CE] pb-2">
            Calibration Summary
          </p>
          <div className="flex justify-between">
            <span className="text-smoke">Order Identification:</span>
            <span className="font-semibold text-charcoal">{placedOrderIds.join(", ")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-smoke">Recipient:</span>
            <span className="font-semibold text-charcoal">{shipping.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-smoke">Delivery Atelier Address:</span>
            <span className="font-semibold text-charcoal truncate max-w-[240px]">
              {shipping.addressLine1}, {shipping.city}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-smoke">ETA:</span>
            <span className="font-semibold text-[#1D9E75]">Standard 2-3 Delivery Days</span>
          </div>
          <div className="flex justify-between border-t border-[#E8D8CE] pt-3 mt-3">
            <span className="text-smoke font-semibold uppercase">Total Paid:</span>
            <span className="font-bold text-[#C07840] text-sm">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Timeline representation */}
        <div className="mb-8 w-full bg-white border border-[#E8D8CE] p-6 rounded-xl flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#1D9E75]" />
            <span className="text-[#1D9E75] font-semibold">Confirmed</span>
          </div>
          <div className="h-0.5 flex-grow mx-4 border-t-2 border-dashed border-[#E8D8CE]" />
          <div className="flex items-center gap-2 text-smoke">
            <span className="h-3 w-3 rounded-full border border-[#E8D8CE]" />
            <span>Dispatched</span>
          </div>
          <div className="h-0.5 flex-grow mx-4 border-t-2 border-dashed border-[#E8D8CE]" />
          <div className="flex items-center gap-2 text-smoke">
            <span className="h-3 w-3 rounded-full border border-[#E8D8CE]" />
            <span>Arrived</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/products"
            className="rounded bg-[#1C1410] hover:bg-charcoal text-[#FAF6F2] px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/profile"
            className="rounded border border-[#C4607A] text-[#C4607A] hover:bg-[#F5EDE4] px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Track Order
          </Link>
        </div>
      </div>
    );
  }

  // ── PAGE 11: SECURE CHECKOUT VIEW ──
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow bg-[#FAF6F2] text-charcoal">
      
      {/* Back to Cart */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C4607A] hover:underline mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Cart
        </Link>

        {/* Steps progress indicator */}
        <div className="flex items-center justify-between max-w-md mb-6 text-[10px] font-semibold uppercase tracking-wider text-smoke">
          <div className="flex items-center gap-1.5 text-[#1D9E75]">
            <span className="h-5 w-5 rounded-full bg-[#1D9E75] text-white flex items-center justify-center text-[9px]">1</span>
            <span>Cart</span>
          </div>
          <div className="h-0.5 flex-grow mx-3 bg-[#1D9E75]" />
          <div className="flex items-center gap-1.5 text-[#8B3A52]">
            <span className="h-5 w-5 rounded-full bg-[#8B3A52] text-white flex items-center justify-center text-[9px]">2</span>
            <span>Shipping</span>
          </div>
          <div className="h-0.5 flex-grow mx-3 bg-[#E8D8CE]" />
          <div className="flex items-center gap-1.5 text-smoke">
            <span className="h-5 w-5 rounded-full border border-[#E8D8CE] flex items-center justify-center text-[9px]">3</span>
            <span>Payment</span>
          </div>
        </div>

        <h1 className="text-3xl font-sans font-medium text-charcoal">
          Secure Checkout
        </h1>
      </div>

      <form
        onSubmit={handleCheckout}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left: Shipping Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-[#E8D8CE] bg-ivory p-6 space-y-5 shadow-luxury-light">
            <div className="flex items-center gap-2 border-b border-[#E8D8CE] pb-3 mb-2">
              <MapPin className="h-4.5 w-4.5 text-rose" />
              <h3 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal">
                Shipping Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-smoke block mb-1.5">
                  Contact Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={shipping.name}
                    onChange={(e) =>
                      setShipping({ ...shipping, name: e.target.value })
                    }
                    placeholder="Recipient name"
                    className="w-full pl-9 pr-3 h-10 border border-[#E8D8CE] bg-[#FAF6F2] rounded text-xs text-charcoal placeholder:text-smoke/50 focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A]"
                  />
                  <User className="absolute left-3 top-3 h-4 w-4 text-smoke" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-smoke block mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping({ ...shipping, phone: e.target.value })
                    }
                    placeholder="10-digit phone number"
                    className="w-full pl-9 pr-3 h-10 border border-[#E8D8CE] bg-[#FAF6F2] rounded text-xs text-charcoal placeholder:text-smoke/50 focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A]"
                  />
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-smoke" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-smoke block mb-1.5">
                  Street Address *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={shipping.addressLine1}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        addressLine1: e.target.value,
                      })
                    }
                    placeholder="House, building, suite, street address"
                    className="w-full pl-9 pr-3 h-10 border border-[#E8D8CE] bg-[#FAF6F2] rounded text-xs text-charcoal placeholder:text-smoke/50 focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A]"
                  />
                  <Home className="absolute left-3 top-3 h-4 w-4 text-smoke" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-smoke block mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping({ ...shipping, city: e.target.value })
                  }
                  className="w-full px-3 h-10 border border-[#E8D8CE] bg-[#FAF6F2] rounded text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A]"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-smoke block mb-1.5">
                  State *
                </label>
                <select
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping({ ...shipping, state: e.target.value })
                  }
                  className="w-full px-3 h-10 border border-[#E8D8CE] bg-[#FAF6F2] rounded text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A] cursor-pointer"
                >
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-smoke block mb-1.5">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  pattern="^[1-9][0-9]{5}$"
                  placeholder="6 digits pincode"
                  value={shipping.pincode}
                  onChange={(e) =>
                    setShipping({ ...shipping, pincode: e.target.value })
                  }
                  className="w-full px-3 h-10 border border-[#E8D8CE] bg-[#FAF6F2] rounded text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-xl border border-[#E8D8CE] bg-ivory p-6 space-y-4 shadow-luxury-light">
            <div className="flex items-center gap-2 border-b border-[#E8D8CE] pb-3 mb-2">
              <CreditCard className="h-4.5 w-4.5 text-rose" />
              <h3 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal">
                Payment Option
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`flex gap-3 p-4 rounded border items-start cursor-pointer transition-colors ${
                  paymentMethod === "COD"
                    ? "border-2 border-[#8B3A52] bg-[#FDF0EB]"
                    : "border-[#E8D8CE] hover:bg-[#FAF6F2]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 accent-[#8B3A52]"
                />
                <div>
                  <p className="text-xs font-semibold text-charcoal">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[10px] text-smoke mt-1 font-light leading-relaxed">
                    Pay with physical cash upon delivery.
                  </p>
                </div>
              </label>

              <label
                className={`flex gap-3 p-4 rounded border items-start cursor-pointer transition-colors ${
                  paymentMethod === "CARD"
                    ? "border-2 border-[#8B3A52] bg-[#FDF0EB]"
                    : "border-[#E8D8CE] hover:bg-[#FAF6F2]"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="mt-1 accent-[#8B3A52]"
                />
                <div>
                  <p className="text-xs font-semibold text-charcoal">
                    Mock Debit/Credit Card
                  </p>
                  <p className="text-[10px] text-smoke mt-1 font-light leading-relaxed">
                    Instant sandbox transaction for fast test verification.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Review */}
        <div className="lg:col-span-4 p-6 rounded-xl border border-[#E8D8CE] bg-ivory space-y-4 shadow-luxury-light">
          <h3 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal border-b border-[#E8D8CE] pb-3">
            Order Review
          </h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-[#E8D8CE]/40 pb-3 pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal truncate">
                    {item.product.title}
                  </p>
                  <p className="text-[10px] text-smoke font-light mt-0.5">
                    Qty: {item.quantity} x {formatCurrency(item.product.price)}
                  </p>
                </div>
                <span className="font-bold text-charcoal shrink-0">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-xs text-smoke font-light border-b border-[#E8D8CE] pb-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="text-charcoal font-semibold">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-[#1D9E75] font-semibold">
                {shippingCharge === 0 ? "FREE" : formatCurrency(shippingCharge)}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-bold border-b border-[#E8D8CE] pb-4">
            <span className="text-[#1C1410]">Total Price</span>
            <span className="text-base font-bold text-[#C07840]">
              {formatCurrency(total)}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded bg-[#8B3A52] hover:bg-[#C4607A] text-[#FAF6F2] py-3 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-60 cursor-pointer shadow-luxury-light"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5" /> Place Order
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8A7D76] font-medium pt-2">
            <ShieldCheck className="h-4 w-4 text-[#1D9E75]" />
            <span>Secured 256-bit SSL Transaction</span>
          </div>
        </div>
      </form>
    </div>
  );
}
