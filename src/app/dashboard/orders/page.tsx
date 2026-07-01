// =============================================================================
// Andromeda — Seller Orders Management Overview Page (Server Component)
// =============================================================================

import { Suspense } from "react";
import { listSellerOrders } from "@/lib/actions/seller";
import OrdersClient from "@/components/dashboard/OrdersClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Store Orders — Andromeda Seller",
  description: "Manage orders placed with your store.",
};

export default function SellerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface">
          <div className="animate-pulse space-y-4 text-center">
            <div className="h-8 w-48 bg-surface-container rounded mx-auto" />
            <div className="text-xs text-on-surface-variant animate-bounce">Loading orders...</div>
          </div>
        </div>
      }
    >
      <SellerOrdersPageContent />
    </Suspense>
  );
}

async function SellerOrdersPageContent() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "seller" && role !== "admin") {
    redirect("/");
  }

  // Fetch orders placed with this store
  const result = await listSellerOrders();

  if (result.error) {
    return (
      <div className="rounded-xl border border-outline-variant/20 bg-surface-card p-8 text-center">
        <h2 className="text-lg font-bold text-error mb-2">Error Loading Orders</h2>
        <p className="text-xs text-on-surface-variant">
          {result.error === "NO_SELLER"
            ? "Please complete your store profile to view orders."
            : "Something went wrong. Please try again."}
        </p>
      </div>
    );
  }

  // Cast orders to matching UI structure
  const ordersList = (result.orders || []).map((o: any) => ({
    ...o,
    createdAt: o.createdAt ? new Date(o.createdAt) : new Date(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt) : new Date(),
    estimatedDelivery: o.estimatedDelivery ? new Date(o.estimatedDelivery) : null,
  }));

  return <OrdersClient orders={ordersList} />;
}
