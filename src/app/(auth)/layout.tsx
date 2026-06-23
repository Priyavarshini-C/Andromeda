// =============================================================================
// Andromeda — Auth Page Shell Layout
// =============================================================================

import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-md w-full space-y-8 bg-surface-variant p-8 rounded-2xl border border-outline/10 shadow-xl backdrop-blur-md">
        {children}
      </div>
    </div>
  );
}
