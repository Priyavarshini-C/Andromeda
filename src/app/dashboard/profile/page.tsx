// =============================================================================
// Andromeda — Seller Profile Editor Page (Server Component)
// =============================================================================

import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import ProfileEditorClient from "@/components/dashboard/ProfileEditorClient";

async function ProfileContent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await db
    .select()
    .from(sellers)
    .where(eq(sellers.userId, session.user.id))
    .limit(1);

  if (result.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-primary">No seller profile found</h2>
      </div>
    );
  }

  const seller = result[0];

  return (
    <ProfileEditorClient
      seller={{
        id: seller.id,
        businessName: seller.businessName,
        description: seller.description || "",
        addressLine1: seller.addressLine1 || "",
        city: seller.city || "",
        state: seller.state || "",
        pincode: seller.pincode || "",
        phone: seller.phone || "",
        email: seller.email || "",
        website: seller.website || "",
        businessHours: seller.businessHours || "{}",
      }}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4 max-w-2xl">
          <div className="h-8 w-48 bg-surface-container rounded" />
          <div className="h-64 bg-surface-container rounded-xl" />
          <div className="h-48 bg-surface-container rounded-xl" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
