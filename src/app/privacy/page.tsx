// =============================================================================
// Andromeda — Privacy Policy Page
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Andromeda",
  description:
    "Andromeda Privacy Policy — how we collect, use, and protect your personal data.",
};

const LAST_UPDATED = "June 2026";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="gradient-hero text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            <Shield className="h-3.5 w-3.5" />
            Legal
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs text-slate-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="prose prose-sm max-w-none text-on-surface-variant space-y-8">
          
          <div className="bg-surface-card rounded-xl border border-outline-variant p-5 shadow-observatory">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Andromeda Technologies (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you use the Andromeda platform. Please read this policy carefully. If
              you disagree with its terms, please discontinue use of the platform.
            </p>
          </div>

          {[
            {
              title: "1. Information We Collect",
              content: [
                "**Account Information:** When you register, we collect your name, email address, and password hash. Sellers additionally provide business name, address, GSTIN, and phone number.",
                "**Usage Data:** We collect data about how you interact with Andromeda — pages visited, search queries, products viewed, wishlist items, and comparison sessions. This data is anonymised and aggregated for analytics.",
                "**Location Data:** Location is only accessed when you explicitly grant permission (e.g., to show nearby stores). We do not track location in the background.",
                "**Device & Technical Data:** IP address, browser type, operating system, and session identifiers for security and performance optimisation.",
              ],
            },
            {
              title: "2. How We Use Your Information",
              content: [
                "To create and maintain your account and provide personalised product recommendations.",
                "To process transactions and send service-related communications.",
                "To improve search relevance, platform performance, and user experience.",
                "To send price drop alerts and stock notifications you have explicitly subscribed to.",
                "To detect and prevent fraud, abuse, and security incidents.",
                "To comply with applicable laws and regulations (Indian IT Act, IT Rules 2021).",
              ],
            },
            {
              title: "3. Data Sharing",
              content: [
                "**We do not sell your personal data.** Ever.",
                "We share data with sellers only to the extent necessary to facilitate transactions you initiate (e.g., a seller receives your query details when you contact them through Andromeda).",
                "We use third-party services including Vercel (hosting), Sentry (error tracking), and Upstash Redis (caching). Each provider is contractually bound to GDPR-equivalent data protection standards.",
                "We may disclose information if required by law, court order, or to protect the safety of our users.",
              ],
            },
            {
              title: "4. Cookies & Tracking",
              content: [
                "We use essential cookies for authentication sessions and preference storage (e.g., theme).",
                "We use analytics cookies to understand aggregate usage patterns. No advertising cookies or cross-site tracking is used.",
                "You can control cookie preferences in your browser settings. Disabling essential cookies will affect authentication functionality.",
              ],
            },
            {
              title: "5. Data Retention",
              content: [
                "Account data is retained while your account is active and for up to 30 days after deletion.",
                "Anonymised analytics data may be retained indefinitely in aggregated form.",
                "Price history and review data associated with products is retained for platform integrity purposes.",
              ],
            },
            {
              title: "6. Your Rights",
              content: [
                "**Access:** Request a copy of all personal data we hold about you.",
                "**Correction:** Request correction of inaccurate personal data.",
                "**Deletion:** Request deletion of your account and associated personal data (subject to legal retention obligations).",
                "**Portability:** Receive your data in a structured, machine-readable format.",
                "To exercise any of these rights, email us at privacy@andromeda.app. We will respond within 30 days.",
              ],
            },
            {
              title: "7. Security",
              content: [
                "Passwords are hashed using bcrypt with a minimum cost factor of 10. We never store plaintext passwords.",
                "All data transmission uses TLS 1.3 encryption. Sensitive data at rest is encrypted.",
                "We conduct periodic security reviews and apply dependency patches within 48 hours of disclosure.",
                "In the event of a data breach affecting your personal data, we will notify you within 72 hours as required by applicable law.",
              ],
            },
            {
              title: "8. Children's Privacy",
              content: [
                "Andromeda is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If we discover we have inadvertently collected such data, we will delete it promptly.",
              ],
            },
            {
              title: "9. Changes to This Policy",
              content: [
                "We may update this Privacy Policy periodically. We will notify registered users of material changes via email and prominently display the update date at the top of this page. Continued use of Andromeda after changes constitutes acceptance of the revised policy.",
              ],
            },
            {
              title: "10. Contact",
              content: [
                "For privacy-related inquiries, contact our Data Protection Officer at privacy@andromeda.app or write to: Andromeda Technologies, Bengaluru, Karnataka, India.",
              ],
            },
          ].map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-base font-bold text-primary border-b border-outline-variant pb-2">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.content.map((item, i) => (
                  <li key={i} className="text-sm text-on-surface-variant leading-relaxed">
                    {item.startsWith("**") ? (
                      <>
                        <strong className="text-primary font-semibold">
                          {item.match(/\*\*(.*?)\*\*/)?.[1]}
                        </strong>
                        {item.replace(/\*\*(.*?)\*\*/, "")}
                      </>
                    ) : (
                      `• ${item}`
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-5">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This Privacy Policy is governed by the laws of India, including the Information Technology
              Act 2000, the IT (Amendment) Act 2008, and the applicable provisions of the Digital
              Personal Data Protection Act 2023.{" "}
              <Link href="/terms" className="text-secondary font-semibold hover:underline">
                See our Terms & Conditions
              </Link>{" "}
              for the complete legal framework governing use of the platform.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
