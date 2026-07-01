// =============================================================================
// Andromeda — Seller Dashboard Server Actions
// =============================================================================

"use server";

import { db } from "@/lib/db";
import { sellers, products, orders, orderItems, alerts, wishlists, notifications, users } from "@/lib/db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helper: Get current seller or throw
// ---------------------------------------------------------------------------
async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) return { error: "UNAUTHORIZED" as const, seller: null };

  const role = session.user.role;
  if (role !== "seller" && role !== "admin") return { error: "FORBIDDEN" as const, seller: null };

  const result = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1);

  if (result.length === 0) return { error: "NO_SELLER" as const, seller: null };

  return { error: null, seller: result[0] };
}

// ---------------------------------------------------------------------------
// Update Seller Profile
// ---------------------------------------------------------------------------
export async function updateSellerProfile(values: {
  businessName: string;
  description: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  businessHours: string; // JSON string
}) {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND" };

  try {
    await db
      .update(sellers)
      .set({
        businessName: values.businessName,
        description: values.description,
        addressLine1: values.addressLine1,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        phone: values.phone,
        email: values.email,
        website: values.website,
        businessHours: values.businessHours,
        updatedAt: new Date(),
      })
      .where(eq(sellers.id, seller.id));

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard");
    revalidatePath("/stores");
    return { success: true };
  } catch (err) {
    console.error("updateSellerProfile error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Add Product
// ---------------------------------------------------------------------------
export async function addProduct(values: {
  title: string;
  description: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  stock: number;
  brand: string;
  specs: string; // JSON string
  status: "draft" | "active";
  images?: string;
  thumbnailUrl?: string;
}) {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND" };

  // Generate slug
  const slug = values.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);

  try {
    await db.insert(products).values({
      sellerId: seller.id,
      categoryId: values.categoryId,
      title: values.title,
      slug,
      description: values.description,
      price: values.price,
      originalPrice: values.originalPrice,
      stock: values.stock,
      brand: values.brand,
      specs: values.specs || "{}",
      status: values.status,
      images: values.images || "[]",
      thumbnailUrl: values.thumbnailUrl || null,
    });

    // Update seller product count
    const [{ count }] = await db
      .select({ count: db.$count(products) })
      .from(products)
      .where(eq(products.sellerId, seller.id));

    await db
      .update(sellers)
      .set({ productCount: count, updatedAt: new Date() })
      .where(eq(sellers.id, seller.id));

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("addProduct error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Update Product Status (archive / activate / hide)
// ---------------------------------------------------------------------------
export async function updateProductStatus(
  productId: string,
  status: "active" | "draft" | "hidden" | "removed"
) {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND" };

  try {
    await db
      .update(products)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)));

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("updateProductStatus error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Update Price & Stock (Inventory)
// ---------------------------------------------------------------------------
export async function updateProductPriceStock(
  productId: string,
  values: { price?: number; originalPrice?: number; stock?: number }
) {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND" };

  try {
    const updateData: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
    if (values.price !== undefined) updateData.price = values.price;
    if (values.originalPrice !== undefined) updateData.originalPrice = values.originalPrice;
    if (values.stock !== undefined) updateData.stock = values.stock;

    await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)));

    revalidatePath("/dashboard/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("updateProductPriceStock error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Edit Product (Full Update + Price-Drop Alert Trigger)
// ---------------------------------------------------------------------------
export async function editProduct(
  productId: string,
  values: {
    title?: string;
    description?: string;
    categoryId?: string;
    price?: number;
    originalPrice?: number;
    stock?: number;
    brand?: string;
    specs?: string;
    status?: "draft" | "active" | "hidden";
    images?: string;
    thumbnailUrl?: string;
  }
) {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND" };

  try {
    // Get current product to detect price drops
    const currentProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)))
      .limit(1);

    if (currentProducts.length === 0) {
      return { error: "PRODUCT_NOT_FOUND" };
    }

    const currentProduct = currentProducts[0];
    const oldPrice = currentProduct.price;
    const newPrice = values.price ?? oldPrice;

    // Build update payload
    const updateData: Partial<typeof products.$inferInsert> = { updatedAt: new Date() };
    if (values.title !== undefined) updateData.title = values.title;
    if (values.description !== undefined) updateData.description = values.description;
    if (values.categoryId !== undefined) updateData.categoryId = values.categoryId;
    if (values.price !== undefined) updateData.price = values.price;
    if (values.originalPrice !== undefined) updateData.originalPrice = values.originalPrice;
    if (values.stock !== undefined) updateData.stock = values.stock;
    if (values.brand !== undefined) updateData.brand = values.brand;
    if (values.specs !== undefined) updateData.specs = values.specs;
    if (values.status !== undefined) updateData.status = values.status;
    if (values.images !== undefined) updateData.images = values.images;
    if (values.thumbnailUrl !== undefined) updateData.thumbnailUrl = values.thumbnailUrl;

    await db
      .update(products)
      .set(updateData)
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)));

    // -----------------------------------------------------------------------
    // Price-Drop Alert: notify users who wishlisted this product and have an
    // active alert with a target price >= new price
    // -----------------------------------------------------------------------
    if (values.price !== undefined && newPrice < oldPrice) {
      try {
        // Find active price alerts for this product where target price is met
        const triggeredAlerts = await db
          .select()
          .from(alerts)
          .where(
            and(
              eq(alerts.productId, productId),
              eq(alerts.alertType, "price"),
              eq(alerts.isActive, true)
            )
          );

        const eligibleAlerts = triggeredAlerts.filter(
          (a: any) => a.targetPrice === null || newPrice <= (a.targetPrice ?? Infinity)
        );

        if (eligibleAlerts.length > 0) {
          // Also find wishlist users for this product (for generic price drop notifications)
          const wishlistUsers = await db
            .select({ userId: wishlists.userId })
            .from(wishlists)
            .where(eq(wishlists.productId, productId));

          // Unique user IDs from both alerts and wishlists
          const alertUserIds = eligibleAlerts.map((a: any) => a.userId);
          const wishlistUserIds = wishlistUsers.map((w: any) => w.userId);
          const allUserIds = [...new Set([...alertUserIds, ...wishlistUserIds])];

          if (allUserIds.length > 0) {
            const priceDropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
            const productTitle = values.title || currentProduct.title;

            // Insert in-app notifications for each user
            await db.insert(notifications).values(
              allUserIds.map((userId: any) => ({
                userId,
                title: `🎉 Price Drop Alert!`,
                message: `"${productTitle}" dropped by ${priceDropPercent}% — now ₹${newPrice.toLocaleString("en-IN")} (was ₹${oldPrice.toLocaleString("en-IN")}).`,
                type: "price_drop",
                isRead: false,
              }))
            );

            // Update triggered alerts
            if (eligibleAlerts.length > 0) {
              await db
                .update(alerts)
                .set({
                  triggerCount: 1, // simplified for MVP
                  lastTriggeredAt: new Date(),
                })
                .where(
                  and(
                    eq(alerts.productId, productId),
                    inArray(alerts.userId, alertUserIds)
                  )
                );
            }

            // Console log (simulated notification delivery for MVP)
            console.log(`\n[Price Drop Alert] ${productTitle}`);
            console.log(`  Old price: ₹${oldPrice} → New price: ₹${newPrice} (${priceDropPercent}% off)`);
            console.log(`  Notified ${allUserIds.length} users via in-app notifications.\n`);
          }
        }
      } catch (alertErr) {
        // Non-fatal: log but don't block the product update response
        console.error("Price-drop alert error (non-fatal):", alertErr);
      }
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("editProduct error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Delete Product

// ---------------------------------------------------------------------------
export async function deleteProduct(productId: string) {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND" };

  try {
    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.sellerId, seller.id)));

    // Update seller product count
    const [{ count }] = await db
      .select({ count: db.$count(products) })
      .from(products)
      .where(eq(products.sellerId, seller.id));

    await db
      .update(sellers)
      .set({ productCount: count, updatedAt: new Date() })
      .where(eq(sellers.id, seller.id));

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/products");
    return { success: true };
  } catch (err) {
    console.error("deleteProduct error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// List Seller Orders
// ---------------------------------------------------------------------------
export async function listSellerOrders() {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND", orders: [] };

  try {
    const sellerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.sellerId, seller.id))
      .orderBy(desc(orders.createdAt));

    const populatedOrders = await Promise.all(
      sellerOrders.map(async (order: any) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        
        // Fetch buyer user details (name/email)
        const buyerResult = await db
          .select({ name: sql<string>`(SELECT name FROM users WHERE users.id = ${orders.userId})` })
          .from(orders)
          .where(eq(orders.id, order.id))
          .limit(1);

        return {
          ...order,
          items,
          buyerName: buyerResult[0]?.name || "Customer",
        };
      })
    );

    return { success: true, orders: populatedOrders };
  } catch (err) {
    console.error("listSellerOrders error:", err);
    return { error: "SERVER_ERROR", orders: [] };
  }
}

// ---------------------------------------------------------------------------
// Update Order Status
// ---------------------------------------------------------------------------
export async function updateOrderStatus(
  orderId: string,
  values: { status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"; trackingNumber?: string }
) {
  const { error, seller } = await requireSeller();
  if (error || !seller) return { error: error || "NOT_FOUND" };

  try {
    const updateData: Partial<typeof orders.$inferInsert> = {
      status: values.status,
      updatedAt: new Date(),
    };
    if (values.trackingNumber !== undefined) {
      updateData.trackingNumber = values.trackingNumber;
    }

    await db
      .update(orders)
      .set(updateData)
      .where(and(eq(orders.id, orderId), eq(orders.sellerId, seller.id)));

    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return { error: "SERVER_ERROR" };
  }
}

