// =============================================================================
// Andromeda — About Page
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Telescope, ShieldCheck, Zap, Users, Globe, TrendingUp, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Andromeda — Product Discovery & Comparison Platform",
  description:
    "Learn how Andromeda is transforming product discovery by connecting shoppers with the best prices across marketplaces, brands, and local businesses.",
};

const VALUES = [
  {
    icon: Telescope,
    title: "Universal Discovery",
    desc: "We scan every corner of the market — global marketplaces, independent brands, and the local shop around the corner — so you never miss a better deal.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: ShieldCheck,
    title: "Radical Transparency",
    desc: "No hidden ads, no paid rankings. Every comparison is based purely on price, ratings, availability, and verified seller reputation.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Zap,
    title: "Real-Time Intelligence",
    desc: "Price history, stock alerts, and live seller comparisons — all updated in real time so you can make confident decisions instantly.",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    icon: Users,
    title: "Community-First Reviews",
    desc: "Verified purchase badges, NLP-filtered fake reviews, and helpful/unhelpful voting ensure you only read reviews you can actually trust.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Local Business Empowerment",
    desc: "We give independent local sellers the same digital shelf space as national giants — levelling the playing field with technology.",
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    icon: TrendingUp,
    title: "Always Getting Smarter",
    desc: "AI-powered recommendation and price prediction engines continuously learn from millions of signals to surface the right products for you.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
];

const STATS = [
  { value: "10M+", label: "Products indexed" },
  { value: "5,000+", label: "Verified sellers" },
  { value: "< 100ms", label: "Search latency" },
  { value: "99.9%", label: "Platform uptime" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="gradient-hero text-white py-20 lg:py-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-tertiary/10 blur-3xl" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            <Telescope className="h-3.5 w-3.5" />
            Our Mission
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            The Universe of Product Discovery
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Andromeda was founded on a single insight: shopping is broken. Products are scattered
            across dozens of platforms, prices are impossible to compare, and local businesses are
            invisible online. We&apos;re fixing all of that.
          </p>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="bg-surface-card border-b border-outline-variant py-8 px-4">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">
          The Story
        </h2>
        <h3 className="text-2xl font-bold text-primary mb-6">
          Built for buyers, empowering sellers
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl mx-auto mb-4">
          Every day, millions of people waste hours visiting Amazon, Flipkart, Meesho, Myntra, and
          dozens of local websites trying to find the best price on a single product. Meanwhile,
          small local businesses — with often better prices and faster delivery — go undiscovered.
        </p>
        <p className="text-sm text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
          Andromeda was built to solve both problems simultaneously. We built a unified discovery
          platform where <strong className="text-primary">one search</strong> surfaces products from
          every relevant source, ranks them by value, and gives local sellers an equal seat at the
          table. No matter if you are looking for the cheapest deal or the nearest shop — Andromeda
          finds it for you.
        </p>
      </section>

      {/* Values Grid */}
      <section className="bg-slate-50 dark:bg-surface-container/20 border-t border-b border-outline-variant py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">
              What We Stand For
            </h2>
            <h3 className="text-2xl font-bold text-primary">Our Core Values</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-surface-card rounded-xl border border-outline-variant p-6 shadow-observatory hover:shadow-observatory-lifted transition-shadow"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${v.bg} ${v.color} mb-4`}
                >
                  <v.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-primary mb-2">{v.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Join the Andromeda Ecosystem</h2>
        <p className="text-sm text-on-surface-variant mb-8 max-w-xl mx-auto">
          Whether you&apos;re a shopper looking for the best deal or a business ready to reach more
          customers — Andromeda is built for you.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Start Exploring
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/seller"
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-card text-primary px-6 py-3 text-sm font-bold hover:bg-surface-container transition-colors"
          >
            Join as a Seller
          </Link>
        </div>
      </section>
    </div>
  );
}
