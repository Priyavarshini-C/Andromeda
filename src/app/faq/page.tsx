// =============================================================================
// Andromeda — FAQ Page
// =============================================================================

"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import Link from "next/link";

const FAQS = [
  {
    category: "Shopping & Search",
    questions: [
      {
        q: "How does Andromeda find products from multiple sources?",
        a: "Andromeda aggregates product data from registered sellers, verified local businesses, and integrated marketplace feeds. Our real-time search engine scans all sources simultaneously when you submit a query, returning ranked and deduplicated results within milliseconds.",
      },
      {
        q: "Are the prices on Andromeda always up to date?",
        a: "For registered Andromeda sellers, prices update in real time as sellers modify their listings. For aggregated external sources (Amazon, Flipkart, etc.), prices are refreshed at regular intervals and may lag by up to 30 minutes. Always verify final pricing on the seller's platform before purchasing.",
      },
      {
        q: "How does the product comparison engine work?",
        a: "Select up to 4 products and click 'Compare'. Our engine fetches specifications, price history, review summaries, and multi-seller pricing for each product and renders them in a side-by-side matrix. Badges highlight which product is cheapest, highest-rated, or best-value.",
      },
      {
        q: "Can I set price drop alerts?",
        a: "Yes! On any product page, click 'Set Alert', choose your target price, and we'll notify you via email and in-app notification when the product hits or falls below that price.",
      },
    ],
  },
  {
    category: "Sellers & Businesses",
    questions: [
      {
        q: "How can I list my business on Andromeda?",
        a: "Visit the Seller Portal and complete the multi-step registration. You'll provide your business details, choose whether you have your own website (Type B) or want to sell directly on Andromeda (Type A), and submit for verification. Approval typically takes 24–48 hours.",
      },
      {
        q: "What's the difference between Type A and Type B sellers?",
        a: "Type A sellers don't have their own website. They list products directly on Andromeda with pricing, stock levels, and product details. Customers complete discovery on our platform and contact the seller to purchase. Type B sellers have their own website — they provide product links from their site and customers are redirected to their website to complete the purchase.",
      },
      {
        q: "Is there a fee to list on Andromeda?",
        a: "Basic listings are free during our launch phase. We plan to introduce subscription tiers for premium placement, analytics insights, and promotional features. All early registered sellers will receive preferential pricing on future plans.",
      },
      {
        q: "How does business verification work?",
        a: "After registration, our team reviews your submitted business details and supporting documents (GSTIN, business registration, etc.). Verified businesses receive a blue verification badge on their store profile, which significantly increases buyer trust and search ranking.",
      },
    ],
  },
  {
    category: "Account & Privacy",
    questions: [
      {
        q: "How do I reset my password?",
        a: "On the login page, click 'Forgot Password' and enter your registered email address. We'll send a secure reset link valid for 30 minutes. If you signed up via Google, you'll need to use the 'Continue with Google' option instead.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes. Go to Settings → Account → Delete Account. Your data will be purged within 30 days in compliance with applicable data protection regulations. Active seller accounts must first transfer or close their listings before deletion.",
      },
      {
        q: "Does Andromeda sell my data?",
        a: "Never. Your personal data is used solely to personalise your Andromeda experience and is never sold to third parties. Please read our Privacy Policy for full details on how we collect and process data.",
      },
      {
        q: "What data does Andromeda collect?",
        a: "We collect account information (name, email), search and browsing behaviour on our platform, and wishlist/comparison history. Location data is only accessed with your explicit permission and only to show nearby stores. See our Privacy Policy for complete details.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "Why is the search bar showing no results?",
        a: "Make sure you've typed at least 2 characters. If results are still empty, the category or brand may not yet be listed on Andromeda. Try broader search terms or browse via category filters on the Products page.",
      },
      {
        q: "The comparison page is empty. Why?",
        a: "You need to add products to compare first. On any product card or product page, click the scale icon to add that product to your comparison list. You can compare 2 to 4 products at once.",
      },
      {
        q: "Is Andromeda available on mobile?",
        a: "Andromeda is fully responsive and optimised for mobile browsers. A native iOS and Android app is on our roadmap for Q2 2028. Until then, adding the web app to your home screen gives you an app-like experience.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-outline-variant last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold text-primary leading-snug">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-outline shrink-0 mt-0.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-on-surface-variant leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = FAQS.map((cat) => ({
    ...cat,
    questions: cat.questions.filter(
      (faq) =>
        !searchQuery ||
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((cat) => cat.questions.length > 0);

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="gradient-hero text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" />
            Help Centre
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-sm text-slate-300 max-w-xl mx-auto">
            Everything you need to know about Andromeda. Can&apos;t find your answer?{" "}
            <Link href="/contact" className="text-secondary-container underline underline-offset-2">
              Contact our team.
            </Link>
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-white/10 backdrop-blur border border-white/20 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary-container/50 focus:border-secondary-container transition-all"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="h-12 w-12 text-outline-variant mx-auto mb-4" />
            <h3 className="text-lg font-bold text-primary mb-2">No results found</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Try different search terms or{" "}
              <Link href="/contact" className="text-secondary font-semibold">
                contact our support team
              </Link>.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filtered.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">
                  {cat.category}
                </h2>
                <div className="bg-surface-card rounded-xl border border-outline-variant shadow-observatory px-6 divide-y divide-outline-variant">
                  {cat.questions.map((faq) => (
                    <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Still need help */}
        <div className="mt-12 rounded-xl border border-outline-variant bg-surface-card p-6 text-center shadow-observatory">
          <h3 className="text-base font-bold text-primary mb-2">Still have questions?</h3>
          <p className="text-sm text-on-surface-variant mb-4">
            Our support team is available Monday through Friday, 9 AM to 6 PM IST.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
}
