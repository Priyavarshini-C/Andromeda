// =============================================================================
// Andromeda — Checkout Page
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Home,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";

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
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Chandigarh",
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
    state: INDIAN_STATES[0],
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "CARD">("COD");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchCart();
    }
  }, [status]);

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipping.name || !shipping.phone || !shipping.addressLine1 || !shipping.city || !shipping.pincode) {
      alert("Please fill all required shipping fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: shipping,
          paymentMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPlacedOrderIds(data.data.orderIds || []);
        setOrderSuccess(true);
      } else {
        const err = await res.json();
        alert(err.error?.message || "Order submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shippingCharge = subtotal > 1000 ? 0 : 99;
  const total = subtotal + shippingCharge;

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-secondary mb-2" />
        <p className="text-sm text-on-surface-variant font-medium">
          Loading checkout details...
        </p>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center gap-6 animate-in fade-in duration-200">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle className="h-12 w-12" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant max-w-md mx-auto">
            Thank you for shopping with Andromeda. Your order has been registered
            with the corresponding merchants and is pending fulfillment.
          </p>
        </div>

        <div className="w-full rounded-xl border border-outline-variant bg-surface-card p-5 text-left text-xs space-y-2">
          <p className="font-bold text-primary border-b border-outline-variant/30 pb-2">
            Order Information
          </p>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Order IDs:</span>
            <span className="font-semibold text-primary">
              {placedOrderIds.join(", ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Ship To:</span>
            <span className="font-semibold text-primary">{shipping.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Address:</span>
            <span className="font-semibold text-primary truncate max-w-[200px]">
              {shipping.addressLine1}, {shipping.city}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Total Amount Paid:</span>
            <span className="font-extrabold text-secondary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/products"
            className="rounded-lg bg-primary text-white px-6 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </Link>
          <Link
            href="/profile"
            className="rounded-lg border border-outline-variant text-primary px-6 py-2.5 text-sm font-bold hover:bg-surface-container transition-colors"
          >
            View Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Title & Back Link */}
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:underline mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Cart
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
          Secure Checkout
        </h1>
      </div>

      <form
        onSubmit={handleCheckout}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        {/* Left Side: Shipping Address Form */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border border-outline-variant bg-surface-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3 mb-2">
              <MapPin className="h-5 w-5 text-secondary" />
              <h3 className="text-base font-bold text-primary">
                Shipping Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
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
                    placeholder="Recipient's name"
                    className="w-full rounded-lg border border-outline-variant/50 bg-surface pl-9 pr-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
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
                    placeholder="10-digit number"
                    className="w-full rounded-lg border border-outline-variant/50 bg-surface pl-9 pr-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
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
                    placeholder="House, apartment, suite, street"
                    className="w-full rounded-lg border border-outline-variant/50 bg-surface pl-9 pr-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                  />
                  <Home className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shipping.city}
                  onChange={(e) =>
                    setShipping({ ...shipping, city: e.target.value })
                  }
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                  State *
                </label>
                <select
                  value={shipping.state}
                  onChange={(e) =>
                    setShipping({ ...shipping, state: e.target.value })
                  }
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                >
                  {INDIAN_STATES.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-on-surface-variant block mb-1.5">
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  pattern="^[1-9][0-9]{5}$"
                  placeholder="6 digits"
                  value={shipping.pincode}
                  onChange={(e) =>
                    setShipping({ ...shipping, pincode: e.target.value })
                  }
                  className="w-full rounded-lg border border-outline-variant/50 bg-surface px-3 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="rounded-xl border border-outline-variant bg-surface-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3 mb-2">
              <CreditCard className="h-5 w-5 text-secondary" />
              <h3 className="text-base font-bold text-primary">
                Payment Option
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`flex gap-3 p-4 rounded-xl border items-start cursor-pointer transition-colors ${
                  paymentMethod === "COD"
                    ? "border-secondary bg-secondary/5"
                    : "border-outline-variant/50 hover:bg-surface-container/20"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1 accent-secondary"
                />
                <div>
                  <p className="text-sm font-bold text-primary">
                    Cash on Delivery (COD)
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Pay with cash at the time of delivery.
                  </p>
                </div>
              </label>

              <label
                className={`flex gap-3 p-4 rounded-xl border items-start cursor-pointer transition-colors ${
                  paymentMethod === "CARD"
                    ? "border-secondary bg-secondary/5"
                    : "border-outline-variant/50 hover:bg-surface-container/20"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="mt-1 accent-secondary"
                />
                <div>
                  <p className="text-sm font-bold text-primary">
                    Mock Card Payment
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Instant sandbox transaction for testing checkout.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Side: Order Summary & Review */}
        <div className="lg:col-span-4 p-5 rounded-xl border border-outline-variant bg-surface-card space-y-4">
          <h3 className="text-base font-bold text-primary">Order Review</h3>

          <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant/20 border-b border-outline-variant/30 pb-3 pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <p className="font-semibold text-primary truncate">
                    {item.product.title}
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    Qty: {item.quantity} x {formatCurrency(item.product.price)}
                  </p>
                </div>
                <span className="font-bold text-primary shrink-0">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-xs text-on-surface-variant font-medium border-b border-outline-variant/30 pb-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="text-primary font-semibold">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-primary font-semibold">
                {shippingCharge === 0 ? "FREE" : formatCurrency(shippingCharge)}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-bold text-primary border-b border-outline-variant/30 pb-4">
            <span>Total Price</span>
            <span className="text-base font-extrabold text-secondary">
              {formatCurrency(total)}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-secondary text-white py-2.5 text-sm font-bold hover:bg-secondary/95 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              "Place Order"
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[9px] text-on-surface-variant font-medium pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
            <span>Guaranteed secure payment transaction via Drizzle & SQLite</span>
          </div>
        </div>
      </form>
    </div>
  );
}
