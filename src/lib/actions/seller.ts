// =============================================================================
// Andromeda — Seller Dashboard Server Actions
// =============================================================================

"use server";

import { db } from "@/lib/db";
import { sellers, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Helper: Get current seller or throw
// ---------------------------------------------------------------------------
async function requireSeller() {
  const session = await auth();
  if (!session?.user?.id) return { error: "UNAUTHORIZED" as const, seller: null };

  const role = (session.user as any).role;
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
    const updateData: any = { updatedAt: new Date() };
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
