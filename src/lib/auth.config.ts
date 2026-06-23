// =============================================================================
// Andromeda — Shared NextAuth Configuration (Edge Compatible)
// =============================================================================

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-key",
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      // Route protection
      const isProtectedPage =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/seller") ||
        nextUrl.pathname.startsWith("/admin");

      if (isProtectedPage && !isLoggedIn) {
        return false; // Redirects automatically to pages.signIn (/login)
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || "user";
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Empty array, populated in auth.ts
} satisfies NextAuthConfig;
