// =============================================================================
// Andromeda — Seller Orders Management Dashboard
// =============================================================================

"use client";

import React, { useState, useTransition } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  Loader2,
  Calendar,
  CreditCard,
  Hash,
} from "lucide-react";
import { updateOrderStatus } from "@/lib/actions/seller";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  productTitle: string;
  productImage: string | null;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  userId: string;
  sellerId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string | null;
  paymentReference: string | null;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: string; // JSON string
  trackingNumber: string | null;
  estimatedDelivery: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  buyerName: string;
}

interface OrdersClientProps {
  orders: Order[];
}

export default function OrdersClient({ orders }: OrdersClientProps) {
  const router = useRouter();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Temporary tracking number states per order
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  const toggleOrder = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleUpdateStatus = (
    orderId: string,
    status: Order["status"],
    trackingNumber?: string
  ) => {
    if (status === "refunded") {
      alert("Refunded orders cannot be updated manually.");
      return;
    }
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, { 
        status: status as "pending" | "confirmed" | "shipped" | "delivered" | "cancelled", 
        trackingNumber 
      });
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update order status.");
      }
    });
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amt);
  };

  const parseAddress = (addrStr: string) => {
    try {
      const parsed = JSON.parse(addrStr);
      return parsed;
    } catch {
      return { address: addrStr };
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusBadgeClass = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "confirmed":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shipped":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "delivered":
        return "bg-success/10 text-success border-success/20";
      case "cancelled":
        return "bg-error/10 text-error border-error/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">Customer Orders</h1>
          <p className="text-xs text-on-surface-variant">
            Manage purchases, fulfill orders, and update courier tracking details.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-card px-5 py-12 text-center">
          <ShoppingBag className="h-10 w-10 text-outline-variant mx-auto mb-2" />
          <p className="text-sm text-on-surface-variant">No orders placed with your store yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const address = parseAddress(order.shippingAddress);
            const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={order.id}
                className={`rounded-xl border transition-all overflow-hidden bg-surface-card ${
                  isExpanded
                    ? "border-secondary/40 shadow-observatory"
                    : "border-outline-variant/20 hover:border-outline-variant"
                }`}
              >
                {/* Summary Row */}
                <div
                  onClick={() => toggleOrder(order.id)}
                  className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap cursor-pointer hover:bg-surface-container/20 select-none"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-on-surface-variant">
                        ORDER #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          order.paymentStatus === "paid"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}
                      >
                        {order.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant">
                      <span className="font-semibold text-on-surface">{order.buyerName}</span>
                      <span>•</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                      <span>•</span>
                      <span className="font-bold text-primary">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-on-surface-variant font-medium hidden sm:inline">
                      {dateStr}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-outline" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-outline" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-outline-variant/10 bg-surface-container/10 space-y-5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* Left: Items List */}
                      <div className="md:col-span-7 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider">
                          Ordered Items
                        </p>
                        <div className="space-y-2.5">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant/10 bg-surface-card"
                            >
                              <div className="h-10 w-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 overflow-hidden text-outline">
                                {item.productImage ? (
                                  <img
                                    src={item.productImage}
                                    alt={item.productTitle}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-primary truncate">
                                  {item.productTitle}
                                </p>
                                <p className="text-[10px] text-on-surface-variant font-semibold">
                                  Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                                </p>
                              </div>
                              <span className="text-xs font-extrabold text-on-surface">
                                {formatCurrency(item.totalPrice)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Cost Breakdown */}
                        <div className="rounded-lg border border-outline-variant/10 p-3.5 space-y-2 text-xs text-on-surface-variant font-medium bg-surface-card">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="text-on-surface">{formatCurrency(order.subtotal)}</span>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-success">
                              <span>Discount</span>
                              <span>-{formatCurrency(order.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{formatCurrency(order.shippingAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax (GST)</span>
                            <span>{formatCurrency(order.taxAmount)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-primary pt-2 border-t border-outline-variant/10">
                            <span>Total Earnings</span>
                            <span className="text-secondary">{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Shipping details & Status Update */}
                      <div className="md:col-span-5 space-y-4">
                        {/* Shipping Details */}
                        <div className="p-4 rounded-xl border border-outline-variant/10 bg-surface-card space-y-3 text-xs">
                          <p className="font-bold text-primary uppercase tracking-wider">
                            Shipping Details
                          </p>
                          <div className="flex gap-2">
                            <MapPin className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                            <div className="space-y-1 font-semibold text-on-surface-variant">
                              <p className="text-primary font-bold">{address.fullName || order.buyerName}</p>
                              <p>{address.addressLine1 || address.address}</p>
                              <p>
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              {address.phone && <p>📞 {address.phone}</p>}
                            </div>
                          </div>
                          {order.notes && (
                            <div className="flex gap-2 border-t border-outline-variant/10 pt-2.5">
                              <FileText className="h-4 w-4 text-outline shrink-0 mt-0.5" />
                              <div className="font-medium text-on-surface-variant/80 italic">
                                &quot;{order.notes}&quot;
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Order Status Controller */}
                        <div className="p-4 rounded-xl border border-outline-variant/10 bg-surface-card space-y-4">
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">
                            Update Order
                          </p>
                          
                          {/* Tracking Number Input */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                              Tracking Number / Courier Details
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Enter Tracking No. (e.g., Delhivery, BlueDart)"
                                value={
                                  trackingInputs[order.id] !== undefined
                                    ? trackingInputs[order.id]
                                    : order.trackingNumber || ""
                                }
                                onChange={(e) =>
                                  setTrackingInputs({
                                    ...trackingInputs,
                                    [order.id]: e.target.value,
                                  })
                                }
                                className="flex-1 rounded-lg border border-outline-variant/50 bg-surface px-2.5 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateStatus(
                                    order.id,
                                    order.status,
                                    trackingInputs[order.id] || ""
                                  )
                                }
                                disabled={isPending}
                                className="px-3 py-1.5 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          </div>

                          {/* Quick Status Buttons */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                              Change Order Status
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {order.status === "pending" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "confirmed", order.trackingNumber || "")
                                  }
                                  disabled={isPending}
                                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors cursor-pointer"
                                >
                                  Confirm Order
                                </button>
                              )}
                              {(order.status === "pending" || order.status === "confirmed") && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(
                                      order.id,
                                      "shipped",
                                      trackingInputs[order.id] || order.trackingNumber || ""
                                    )
                                  }
                                  disabled={isPending}
                                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500 text-white rounded-lg text-xs font-bold hover:bg-purple-600 transition-colors cursor-pointer"
                                >
                                  Ship Order
                                </button>
                              )}
                              {order.status === "shipped" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "delivered", order.trackingNumber || "")
                                  }
                                  disabled={isPending}
                                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-success text-white rounded-lg text-xs font-bold hover:bg-success-container transition-colors cursor-pointer"
                                >
                                  Deliver
                                </button>
                              )}
                              {order.status !== "delivered" && order.status !== "cancelled" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(order.id, "cancelled", order.trackingNumber || "")
                                  }
                                  disabled={isPending}
                                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-error text-white rounded-lg text-xs font-bold hover:bg-error-container transition-colors cursor-pointer"
                                >
                                  Cancel Order
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
