// =============================================================================
// Andromeda — Admin Dashboard Page
// Server Component — /admin
// =============================================================================

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStats, listSellers, listRecentOrders, listUsers } from "@/lib/actions/admin";
import { AdminDashboardClient, Seller, Order, User } from "./AdminDashboardClient";

export const metadata = {
  title: "Admin Dashboard | Andromeda",
  description: "Platform administration and management console",
};

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface">
          <div className="animate-pulse space-y-4 text-center">
            <div className="h-8 w-48 bg-surface-container rounded mx-auto" />
            <div className="text-xs text-on-surface-variant animate-bounce">Loading admin console...</div>
          </div>
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}

async function AdminPageContent() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "admin") redirect("/");

  // Fetch all data in parallel
  const [statsResult, sellersResult, ordersResult, usersResult] =
    await Promise.all([
      getAdminStats(),
      listSellers("all", 1, 10),
      listRecentOrders(10),
      listUsers(1, 10),
    ]);

  const stats = ("stats" in statsResult ? statsResult.stats : null) ?? null;
  const sellers = "sellers" in sellersResult ? sellersResult.sellers : [];
  const orders = "orders" in ordersResult ? ordersResult.orders : [];
  const users = "users" in usersResult ? usersResult.users : [];

  return (
    <AdminDashboardClient
      stats={stats}
      sellers={sellers as Seller[]}
      recentOrders={orders as Order[]}
      recentUsers={users as User[]}
    />
  );
}
