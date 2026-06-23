// =============================================================================
// Andromeda — Auth Server Actions
// =============================================================================

"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email)
  });

  if (existingUser) {
    return { error: "Email already in use!" };
  }

  try {
    await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: "user", // Default role
    });
  } catch (dbErr: any) {
    console.error("Database registration error:", dbErr);
    return { error: "Database error during registration." };
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
          return { error: "Something went wrong!" };
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
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}
