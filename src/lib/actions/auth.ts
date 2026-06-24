// =============================================================================
// Andromeda — Auth Server Actions
// =============================================================================

"use server";

import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema } from "@/lib/validations/auth";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function register(values: any) {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validatedFields.data;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (existingUser) {
      return { error: "An account with this email already exists. Please sign in." };
    }

    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "user",
    });
  } catch (dbErr: any) {
    console.error("Database registration error:", dbErr);
    const code = dbErr?.cause?.code ?? dbErr?.code ?? "";
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return { error: "Cannot connect to the database. Please check your DATABASE_URL in .env.local and ensure Supabase is reachable." };
    }
    if (code === "23505") {
      return { error: "An account with this email already exists. Please sign in." };
    }
    return { error: "Database error during registration. Please try again." };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { success: "Registered and logged in!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong during sign-in!" };
      }
    }
    throw error;
  }
}

export async function login(values: any) {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
    return { success: "Logged in!" };
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Incorrect email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // Handle DB connection errors surfaced through signIn
    const code = error?.cause?.code ?? error?.code ?? "";
    if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
      return { error: "Cannot connect to the database. Please check your setup." };
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
export async function loginWithGoogle() {
  const isMock =
    !process.env.GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID.includes("your-google-client-id") ||
    process.env.GOOGLE_CLIENT_ID === "mock-google-client-id";

  if (isMock) {
    const mockEmail = "google-user@andromeda.app";
    try {
      // Ensure mock user exists in the database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, mockEmail)
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash("password123", 10);
        await db.insert(users).values({
          name: "Google Demo User",
          email: mockEmail,
          passwordHash,
          role: "user",
          isActive: true,
        });
      }

      await signIn("credentials", {
        email: mockEmail,
        password: "password123",
        redirectTo: "/",
      });
      return { success: "Logged in via mock Google account!" };
    } catch (err: any) {
      console.error("Mock Google auth error:", err);
      // Rethrow redirect if NextAuth redirects
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      return { error: "Google Mock Sign-In failed." };
    }
  }

  await signIn("google", { redirectTo: "/" });
}

// ---------------------------------------------------------------------------
// Request Password Reset — generates a token, logs link to console (MVP)
// ---------------------------------------------------------------------------
export async function requestPasswordReset(email: string) {
  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      console.log(`[Password Reset] No account found for ${email}`);
      return { success: true };
    }

    // Generate a secure token
    const token = crypto.randomUUID() + "-" + Date.now().toString(36);
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens for this user
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, `reset:${email}`));

    // Insert new token
    await db.insert(verificationTokens).values({
      identifier: `reset:${email}`,
      token,
      expires,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Simulated email — log to console for MVP
    console.log("\n========================================");
    console.log("[Andromeda] Password Reset Link (Dev/MVP)");
    console.log(`To: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log("(Valid for 1 hour)");
    console.log("========================================\n");

    return { success: true };
  } catch (err) {
    console.error("requestPasswordReset error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Reset Password — validates token and sets the new password
// ---------------------------------------------------------------------------
export async function resetPassword({
  email,
  token,
  newPassword,
}: {
  email: string;
  token: string;
  newPassword: string;
}) {
  if (!email || !token || !newPassword) {
    return { error: "All fields are required." };
  }
  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    // Validate token
    const tokenRecord = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, `reset:${email}`),
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      ),
    });

    if (!tokenRecord) {
      return { error: "Invalid or expired reset link. Please request a new one." };
    }

    // Ensure user still exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return { error: "Account not found." };
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.email, email));

    // Delete the used token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, `reset:${email}`));

    return { success: true };
  } catch (err) {
    console.error("resetPassword error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
