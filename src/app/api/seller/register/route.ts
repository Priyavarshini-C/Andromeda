// =============================================================================
// Andromeda — Seller Registration API Route
// POST /api/seller/register
// Creates: user (role=seller) + seller record in a single transaction
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, sellers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    + "-" + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sellerType,
      businessName,
      ownerName,
      businessPhone,
      businessEmail,
      addressLine1,
      city,
      state,
      pincode,
      gstin,
      websiteUrl,
      accountName,
      accountEmail,
      password,
      logoUrl,
      gstUrl,
    } = body;

    // Basic validation
    if (!businessName || !ownerName || !businessPhone || !city || !state) {
      return NextResponse.json({ error: "Missing required business details." }, { status: 400 });
    }
    if (!accountEmail || !password || !accountName) {
      return NextResponse.json({ error: "Missing account credentials." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (sellerType === "website" && !websiteUrl) {
      return NextResponse.json({ error: "Website URL is required for website sellers." }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, accountEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with pending seller role (admin approves -> role becomes seller)
    const [newUser] = await db
      .insert(users)
      .values({
        name: accountName,
        email: accountEmail,
        passwordHash,
        phone: businessPhone,
        role: "user", // will be promoted to seller when admin approves
      })
      .returning({ id: users.id });

    if (!newUser?.id) {
      return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
    }

    // Create seller record
    const sellerSlug = slugify(businessName);

    await db.insert(sellers).values({
      userId: newUser.id,
      businessName,
      businessType: sellerType || "direct",
      slug: sellerSlug,
      description: `${businessName} — ${sellerType === "website" ? "Website Seller" : "Direct Seller"} on Andromeda`,
      website: websiteUrl || null,
      addressLine1: addressLine1 || null,
      city,
      state,
      pincode: pincode || null,
      phone: businessPhone,
      email: businessEmail || accountEmail,
      gstin: gstin || null,
      logoUrl: logoUrl || null,
      gstUrl: gstUrl || null,
      status: "pending", // Requires admin approval
      isVerified: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Seller account created successfully. Pending verification.",
        email: accountEmail,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Seller registration error:", err);

    const pgErr = err as { code?: string; detail?: string; message?: string };
    if (pgErr?.code === "23505") {
      const detail = pgErr?.detail ?? "";
      if (detail.includes("email")) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please sign in." },
          { status: 409 }
        );
      }
      if (detail.includes("slug")) {
        return NextResponse.json(
          { error: "A business with this name already exists. Please use a different name." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "A duplicate record already exists. Please check your details." },
        { status: 409 }
      );
    }

    const message =
      typeof pgErr?.message === "string"
        ? pgErr.message
        : "Internal server error. Please try again.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
