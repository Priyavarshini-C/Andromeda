// =============================================================================
// Andromeda — Seller Portal Landing Page
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import {
  Store, ArrowRight, BadgeCheck, BarChart3, Package, Globe,
  ShieldCheck, Zap, Users, Star, TrendingUp
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sell on Andromeda — Reach Millions of Shoppers",
  description:
    "Join 5,000+ businesses on Andromeda. List your products, reach local and national customers, and grow your business with our free seller platform.",
};

const BENEFITS = [
  {
    icon: Users,
    title: "Massive Reach",
    desc: "Put your products in front of 100,000+ active shoppers searching across all categories every day.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    desc: "Track views, clicks, and performance for each listing. Know exactly which products resonate with buyers.",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    icon: BadgeCheck,
    title: "Verified Seller Badge",
    desc: "Earn a blue verification badge that builds buyer trust and boosts your visibility in search results.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Zap,
    title: "Instant Listing",
    desc: "List products in under 5 minutes. Our streamlined onboarding gets you live and visible immediately.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Globe,
    title: "Works With Your Website",
    desc: "Already have a website? Link your existing product pages and let Andromeda drive traffic to your store.",
    color: "text-error",
    bg: "bg-error/10",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Free to Start",
    desc: "Basic listings are completely free. No transaction fees, no hidden costs during our launch phase.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
];

const SELLER_TYPES = [
  {
    icon: Package,
    type: "Type A",
    title: "Sell Directly on Andromeda",
    subtitle: "No website needed",
    desc: "List your products directly on Andromeda with pricing, images, and stock levels. Customers browse, discover, and contact you through the platform.",
    steps: ["Register your business", "Add products with photos & pricing", "Customers find your products", "They contact you or buy directly"],
    cta: "Get Started",
    href: "/seller/register?type=direct",
    highlight: false,
  },
  {
    icon: Globe,
    type: "Type B",
    title: "Showcase Your Website",
    subtitle: "Drive traffic to your store",
    desc: "Have your own e-commerce website? Add product links from your site. Customers discover you on Andromeda and get redirected to purchase on your platform.",
    steps: ["Register & verify your business", "Submit your website URL", "Add product links from your site", "Customers redirect to your website"],
    cta: "Register with Website",
    href: "/seller/register?type=website",
    highlight: true,
  },
];

const STATS = [
  { value: "5,000+", label: "Active sellers" },
  { value: "Free", label: "To get started" },
  { value: "< 5 min", label: "Onboarding time" },
  { value: "24/7", label: "Seller support" },
];

const TESTIMONIALS = [
  {
    quote: "Andromeda brought us 3x more inquiries in the first month. The setup was incredibly simple.",
    name: "Meera K.",
    business: "CosmoBooks, Bengaluru",
    rating: 5,
    initials: "MK",
  },
  {
    quote: "As a small electronics shop, competing with Amazon seemed impossible. Andromeda changed that.",
    name: "Rajesh P.",
    business: "StarShop Electronics, Pune",
    rating: 5,
    initials: "RP",
  },
  {
    quote: "The analytics dashboard shows exactly which products are getting views. Game-changer for our inventory decisions.",
    name: "Priya N.",
    business: "Home Planet, Kolkata",
    rating: 5,
    initials: "PN",
  },
];

export default function SellerPortalPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="gradient-hero text-white py-20 lg:py-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 rounded-full bg-tertiary/10 blur-3xl" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            <Store className="h-3.5 w-3.5" />
            Seller Portal
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            Grow Your Business with Andromeda
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Join thousands of local businesses and independent sellers reaching millions of shoppers
            every day. Free to start. Powerful to scale.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/seller/register"
              className="inline-flex items-center gap-2 rounded-xl bg-secondary-container text-primary px-6 py-3 text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Start Selling for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 text-white px-6 py-3 text-sm font-bold hover:bg-white/10 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-surface-card border-b border-outline-variant py-8 px-4">
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Choose Your Seller Type */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Two Ways to Sell</h2>
          <h3 className="text-2xl font-bold text-primary">Choose the Model That Fits Your Business</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SELLER_TYPES.map((type) => (
            <div
              key={type.type}
              className={`relative rounded-2xl border p-6 shadow-observatory hover:shadow-observatory-lifted transition-all ${
                type.highlight
                  ? "border-secondary/40 bg-gradient-to-br from-secondary/5 to-surface-card"
                  : "border-outline-variant bg-surface-card"
              }`}
            >
              {type.highlight && (
                <span className="absolute top-4 right-4 rounded-full bg-secondary text-white text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider">
                  Popular
                </span>
              )}
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-4 ${
                type.highlight ? "bg-secondary text-white" : "bg-primary/10 text-primary"
              }`}>
                <type.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{type.type}</span>
              <h4 className="text-lg font-bold text-primary mt-1">{type.title}</h4>
              <p className="text-xs text-secondary font-semibold mb-3">{type.subtitle}</p>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-5">{type.desc}</p>
              <ol className="space-y-2 mb-6">
                {type.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-on-surface-variant">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      type.highlight ? "bg-secondary text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Link
                href={type.href}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                  type.highlight
                    ? "bg-secondary text-white hover:opacity-90"
                    : "bg-primary text-white hover:opacity-90"
                }`}
              >
                {type.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="bg-slate-50 dark:bg-surface-container/20 border-t border-b border-outline-variant py-16 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Why Andromeda</h2>
            <h3 className="text-2xl font-bold text-primary">Everything You Need to Succeed</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-surface-card rounded-xl border border-outline-variant p-6 shadow-observatory">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${b.bg} ${b.color} mb-4`}>
                  <b.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-primary mb-2">{b.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-2">Seller Stories</h2>
          <h3 className="text-2xl font-bold text-primary">Real Businesses, Real Growth</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-surface-card rounded-xl border border-outline-variant p-6 shadow-observatory">
              <div className="flex items-center gap-0.5 text-tertiary mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-primary">{t.name}</p>
                  <p className="text-[11px] text-on-surface-variant">{t.business}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="gradient-hero text-white py-16 px-4">
        <div className="mx-auto max-w-2xl text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-secondary-container" />
          <h2 className="text-2xl font-extrabold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-sm text-slate-300 mb-8 leading-relaxed">
            Join 5,000+ sellers already building their future on Andromeda. Setup takes less than 5
            minutes and your first listing is completely free.
          </p>
          <Link
            href="/seller/register"
            className="inline-flex items-center gap-2 rounded-xl bg-secondary-container text-primary px-8 py-3.5 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Register Your Business Today
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
