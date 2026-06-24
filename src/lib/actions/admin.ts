// =============================================================================
// Andromeda — Admin Server Actions
// =============================================================================

"use server";

import { db } from "@/lib/db";
import { users, sellers, products, orders, notifications } from "@/lib/db/schema";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helper: Require admin role
// ---------------------------------------------------------------------------
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return { error: "UNAUTHORIZED" as const };
  const role = (session.user as any).role;
  if (role !== "admin") return { error: "FORBIDDEN" as const };
  return { error: null, userId: session.user.id };
}

// ---------------------------------------------------------------------------
// Get Platform Stats
// ---------------------------------------------------------------------------
export async function getAdminStats() {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const [usersCount] = await db.select({ value: count() }).from(users);
    const [sellersCount] = await db.select({ value: count() }).from(sellers);
    const [productsCount] = await db.select({ value: count() }).from(products);
    const [ordersCount] = await db.select({ value: count() }).from(orders);

    const [pendingSellersCount] = await db
      .select({ value: count() })
      .from(sellers)
      .where(eq(sellers.status, "pending"));

    const revenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(total_amount), 0)` })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newUsersCount] = await db
      .select({ value: count() })
      .from(users)
      .where(gte(users.createdAt, thirtyDaysAgo));

    return {
      stats: {
        totalUsers: usersCount.value,
        totalSellers: sellersCount.value,
        totalProducts: productsCount.value,
        totalOrders: ordersCount.value,
        pendingSellers: pendingSellersCount.value,
        totalRevenue: revenueResult[0]?.total ?? 0,
        newUsersLast30Days: newUsersCount.value,
      },
    };
  } catch (err) {
    console.error("getAdminStats error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// List All Users (paginated)
// ---------------------------------------------------------------------------
export async function listUsers(page = 1, limit = 20) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const offset = (page - 1) * limit;
    const [usersData, [{ total }]] = await Promise.all([
      db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          emailVerified: users.emailVerified,
        })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users),
    ]);
    return { users: usersData, total, page, limit };
  } catch (err) {
    console.error("listUsers error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Toggle User Active Status
// ---------------------------------------------------------------------------
export async function toggleUserActive(userId: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const [user] = await db
      .select({ isActive: users.isActive })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return { error: "NOT_FOUND" };

    await db
      .update(users)
      .set({ isActive: !user.isActive, updatedAt: new Date() })
      .where(eq(users.id, userId));

    revalidatePath("/admin/users");
    return { success: true, isActive: !user.isActive };
  } catch (err) {
    console.error("toggleUserActive error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// List Sellers with status filter
// ---------------------------------------------------------------------------
export async function listSellers(
  statusFilter: "all" | "pending" | "active" | "suspended" | "rejected" = "all",
  page = 1,
  limit = 20
) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const offset = (page - 1) * limit;
    const whereClause =
      statusFilter !== "all"
        ? eq(sellers.status, statusFilter as any)
        : undefined;

    const [sellersData, [{ total }]] = await Promise.all([
      db
        .select({
          id: sellers.id,
          businessName: sellers.businessName,
          slug: sellers.slug,
          city: sellers.city,
          state: sellers.state,
          status: sellers.status,
          isVerified: sellers.isVerified,
          rating: sellers.rating,
          productCount: sellers.productCount,
          email: sellers.email,
          createdAt: sellers.createdAt,
          gstin: sellers.gstin,
        })
        .from(sellers)
        .where(whereClause)
        .orderBy(desc(sellers.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(sellers)
        .where(whereClause),
    ]);

    return { sellers: sellersData, total, page, limit };
  } catch (err) {
    console.error("listSellers error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Approve Seller
// ---------------------------------------------------------------------------
export async function approveSeller(sellerId: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    // Get seller to find user for notification
    const [seller] = await db
      .select({ userId: sellers.userId, businessName: sellers.businessName })
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (!seller) return { error: "NOT_FOUND" };

    await db
      .update(sellers)
      .set({
        status: "active",
        isVerified: true,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(sellers.id, sellerId));

    // Promote user role to seller
    await db
      .update(users)
      .set({ role: "seller", updatedAt: new Date() })
      .where(eq(users.id, seller.userId));

    // Send notification
    await db.insert(notifications).values({
      userId: seller.userId,
      title: "Seller Account Approved 🎉",
      message: `Congratulations! Your seller account for "${seller.businessName}" has been approved. You can now list products.`,
      type: "general",
    });

    revalidatePath("/admin/sellers");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("approveSeller error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Reject Seller
// ---------------------------------------------------------------------------
export async function rejectSeller(sellerId: string, reason?: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const [seller] = await db
      .select({ userId: sellers.userId, businessName: sellers.businessName })
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (!seller) return { error: "NOT_FOUND" };

    await db
      .update(sellers)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(sellers.id, sellerId));

    await db.insert(notifications).values({
      userId: seller.userId,
      title: "Seller Application Update",
      message: reason
        ? `Your seller application for "${seller.businessName}" was not approved. Reason: ${reason}`
        : `Your seller application for "${seller.businessName}" was not approved at this time.`,
      type: "general",
    });

    revalidatePath("/admin/sellers");
    return { success: true };
  } catch (err) {
    console.error("rejectSeller error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Suspend Seller
// ---------------------------------------------------------------------------
export async function suspendSeller(sellerId: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const [seller] = await db
      .select({ userId: sellers.userId, businessName: sellers.businessName })
      .from(sellers)
      .where(eq(sellers.id, sellerId))
      .limit(1);

    if (!seller) return { error: "NOT_FOUND" };

    await db
      .update(sellers)
      .set({ status: "suspended", updatedAt: new Date() })
      .where(eq(sellers.id, sellerId));

    await db.insert(notifications).values({
      userId: seller.userId,
      title: "Account Suspended",
      message: `Your seller account for "${seller.businessName}" has been suspended. Please contact support.`,
      type: "general",
    });

    revalidatePath("/admin/sellers");
    return { success: true };
  } catch (err) {
    console.error("suspendSeller error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// List Recent Orders (admin view)
// ---------------------------------------------------------------------------
export async function listRecentOrders(limit = 20) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const ordersData = await db
      .select({
        id: orders.id,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        totalAmount: orders.totalAmount,
        currency: orders.currency,
        createdAt: orders.createdAt,
        userName: users.name,
        userEmail: users.email,
        sellerName: sellers.businessName,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(sellers, eq(orders.sellerId, sellers.id))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    return { orders: ordersData };
  } catch (err) {
    console.error("listRecentOrders error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Update Order Status (admin override)
// ---------------------------------------------------------------------------
export async function updateOrderStatus(
  orderId: string,
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded"
) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Featured Product Toggle
// ---------------------------------------------------------------------------
export async function toggleProductFeatured(productId: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const [product] = await db
      .select({ isFeatured: products.isFeatured })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) return { error: "NOT_FOUND" };

    await db
      .update(products)
      .set({ isFeatured: !product.isFeatured, updatedAt: new Date() })
      .where(eq(products.id, productId));

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, isFeatured: !product.isFeatured };
  } catch (err) {
    console.error("toggleProductFeatured error:", err);
    return { error: "SERVER_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// Broadcast Notification to All Users
// ---------------------------------------------------------------------------
export async function broadcastNotification(title: string, message: string) {
  const { error } = await requireAdmin();
  if (error) return { error };

  try {
    const allUsers = await db.select({ id: users.id }).from(users);

    if (allUsers.length === 0) return { error: "NO_USERS" };

    const notifRows = allUsers.map((u) => ({
      userId: u.id,
      title,
      message,
      type: "general" as const,
    }));

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < notifRows.length; i += batchSize) {
      await db.insert(notifications).values(notifRows.slice(i, i + batchSize));
    }

    return { success: true, sentTo: allUsers.length };
  } catch (err) {
    console.error("broadcastNotification error:", err);
    return { error: "SERVER_ERROR" };
  }
}
