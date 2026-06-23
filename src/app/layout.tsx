import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompareBar from "@/components/compare/CompareBar";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-surface text-on-surface font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col pb-20 sm:pb-24">{children}</main>
        <CompareBar />
        <Footer />
      </body>
    </html>
  );
}
