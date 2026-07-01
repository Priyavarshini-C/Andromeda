// =============================================================================
// Andromeda — Seller Dashboard Layout (Role-Gated)
// =============================================================================

import React, { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { sellers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata = {
  title: "Seller Dashboard — Andromeda",
  description: "Manage your store, products, inventory, and pricing.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface">
          <div className="animate-pulse space-y-4 text-center">
            <div className="h-8 w-48 bg-surface-container rounded mx-auto" />
            <div className="text-xs text-on-surface-variant animate-bounce">Loading dashboard shell...</div>
          </div>
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}

async function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = session.user.role;
  if (role !== "seller" && role !== "admin") {
    redirect("/");
  }

  // Fetch seller profile for this user
  const sellerProfile = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1);

  const seller = sellerProfile[0] || null;

  return (
    <DashboardShell
      user={{
        id: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
        role,
      }}
      seller={seller ? {
        id: seller.id,
        businessName: seller.businessName,
        slug: seller.slug,
        isVerified: seller.isVerified,
        status: seller.status,
      } : null}
    >
      {children}
    </DashboardShell>
  );
}
