// =============================================================================
// Andromeda — Edge Middleware (RBAC and Session Protection)
// =============================================================================

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isProtectedApiRoute =
    nextUrl.pathname.startsWith("/api/user") ||
    nextUrl.pathname.startsWith("/api/seller") ||
    nextUrl.pathname.startsWith("/api/admin");

  // 1. Session protection for API routes
  if (isProtectedApiRoute && !isLoggedIn) {
    return NextResponse.json(
      {
        error: {
          code: "UNAUTHORIZED",
          message: "Missing or invalid authentication session",
        },
      },
      { status: 401 }
    );
  }

  // 2. Role-Based Access Control (RBAC) checks
  if (isLoggedIn) {
    const role = (req.auth?.user as any)?.role || "user";

    // Admin routes protection
    const isAdminRoute =
      nextUrl.pathname.startsWith("/api/admin") || nextUrl.pathname.startsWith("/admin");
    if (isAdminRoute && role !== "admin") {
      if (isApiRoute) {
        return NextResponse.json(
          {
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permissions for this resource",
            },
          },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }

    // Seller routes protection (Admins also allowed)
    const isSellerRoute =
      nextUrl.pathname.startsWith("/api/seller") || nextUrl.pathname.startsWith("/seller");
    if (isSellerRoute && role !== "seller" && role !== "admin") {
      if (isApiRoute) {
        return NextResponse.json(
          {
            error: {
              code: "FORBIDDEN",
              message: "Insufficient permissions for this resource",
            },
          },
          { status: 403 }
        );
      }
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all pages except assets/public/static
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // Match protected API routes specifically
    "/api/user/:path*",
    "/api/seller/:path*",
    "/api/admin/:path*",
  ],
};
