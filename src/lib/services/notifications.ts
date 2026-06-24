// =============================================================================
// Andromeda — Notifications Service
// Helper functions to create targeted notifications
// =============================================================================

import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";

export type NotificationType = "general" | "price_drop" | "wishlist" | "order";

// ---------------------------------------------------------------------------
// Create a single notification
// ---------------------------------------------------------------------------
export async function createNotification({
  userId,
  title,
  message,
  type = "general",
}: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}) {
  try {
    await db.insert(notifications).values({ userId, title, message, type });
    return { success: true };
  } catch (err) {
    console.error("createNotification error:", err);
    return { error: "FAILED" };
  }
}

// ---------------------------------------------------------------------------
// Order placed notification (to buyer)
// ---------------------------------------------------------------------------
export async function notifyOrderPlaced(
  userId: string,
  orderRef: string,
  sellerName: string
) {
  return createNotification({
    userId,
    title: "Order Placed Successfully ✅",
    message: `Your order #${orderRef.slice(0, 8).toUpperCase()} from ${sellerName} has been placed and is being processed.`,
    type: "order",
  });
}

// ---------------------------------------------------------------------------
// Order status update notification
// ---------------------------------------------------------------------------
export async function notifyOrderStatusChange(
  userId: string,
  orderRef: string,
  status: string
) {
  const statusMessages: Record<string, string> = {
    confirmed: "Your order has been confirmed and is being prepared.",
    shipped: "Great news! Your order is on its way.",
    delivered: "Your order has been delivered. Enjoy!",
    cancelled: "Your order has been cancelled.",
    refunded: "Your refund has been initiated.",
  };

  const message =
    statusMessages[status] ??
    `Your order #${orderRef.slice(0, 8).toUpperCase()} status updated to: ${status}`;

  return createNotification({
    userId,
    title: `Order Update — ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message,
    type: "order",
  });
}

// ---------------------------------------------------------------------------
// Price drop notification
// ---------------------------------------------------------------------------
export async function notifyPriceDrop(
  userId: string,
  productTitle: string,
  oldPrice: number,
  newPrice: number,
  currency = "INR"
) {
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "€";
  return createNotification({
    userId,
    title: `Price Drop Alert 🔔 — ${productTitle}`,
    message: `The price of "${productTitle}" dropped from ${symbol}${oldPrice.toLocaleString()} to ${symbol}${newPrice.toLocaleString()}. Grab it now!`,
    type: "price_drop",
  });
}

// ---------------------------------------------------------------------------
// New product in wishlist seller store
// ---------------------------------------------------------------------------
export async function notifyWishlistUpdate(
  userId: string,
  productTitle: string
) {
  return createNotification({
    userId,
    title: "Wishlist Alert",
    message: `An item in your wishlist "${productTitle}" has been updated. Check it out!`,
    type: "wishlist",
  });
}
