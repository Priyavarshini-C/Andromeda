// =============================================================================
// Andromeda — Admin Dashboard Page
// Server Component — /admin
// =============================================================================

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAdminStats, listSellers, listRecentOrders, listUsers } from "@/lib/actions/admin";
import { AdminDashboardClient } from "./AdminDashboardClient";

export const metadata = {
  title: "Admin Dashboard | Andromeda",
  description: "Platform administration and management console",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;
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
      sellers={sellers as any[]}
      recentOrders={orders as any[]}
      recentUsers={users as any[]}
    />
  );
}
