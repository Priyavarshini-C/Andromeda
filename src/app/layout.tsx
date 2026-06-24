import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareBar from "@/components/compare/CompareBar";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: "Andromeda — Product Discovery & Comparison Platform",
  description: "One Search. Infinite Choices. Compare products across multiple marketplaces and local sellers instantly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-sans">
        <SessionProvider>
          <Navbar />
          <main className="flex-1 flex flex-col pb-20 sm:pb-24">{children}</main>
          <CompareBar />
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
