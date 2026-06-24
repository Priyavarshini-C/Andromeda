// =============================================================================
// Andromeda — Terms & Conditions Page
// =============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — Andromeda",
  description: "Andromeda Terms & Conditions — the legal agreement governing your use of the Andromeda platform.",
};

const LAST_UPDATED = "June 2026";

export default function TermsPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="gradient-hero text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" />
            Legal
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-xs text-slate-400">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="space-y-8">

          <div className="bg-surface-card rounded-xl border border-outline-variant p-5 shadow-observatory">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              These Terms &amp; Conditions (&quot;Terms&quot;) constitute a legally binding agreement between you
              and Andromeda Technologies (&quot;Andromeda&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your access to
              and use of the Andromeda platform, including all associated features, tools, APIs, and
              services. By accessing or using Andromeda, you agree to be bound by these Terms. If you
              do not agree, do not use the platform.
            </p>
          </div>

          {[
            {
              title: "1. Eligibility",
              items: [
                "You must be at least 13 years of age to create an account on Andromeda.",
                "By registering, you represent that all information you provide is accurate, current, and complete.",
                "Andromeda reserves the right to terminate accounts found to contain false information.",
              ],
            },
            {
              title: "2. User Accounts",
              items: [
                "You are responsible for maintaining the confidentiality of your login credentials. Andromeda is not liable for any loss arising from unauthorized access to your account.",
                "You may not share your account with others or create multiple accounts for the same person.",
                "You may not use automated bots, scrapers, or crawlers to access Andromeda without explicit written consent.",
              ],
            },
            {
              title: "3. Seller Obligations",
              items: [
                "Sellers must provide accurate business information including GSTIN, address, and contact details during registration.",
                "Sellers are solely responsible for the accuracy, legality, and availability of products they list on Andromeda.",
                "Sellers must not list counterfeit, prohibited, or illegal products. Violations will result in immediate account suspension.",
                "Type B sellers (with external websites) are responsible for ensuring their linked product pages remain accurate and accessible.",
                "Andromeda reserves the right to remove any product listing at our discretion without prior notice.",
              ],
            },
            {
              title: "4. Prohibited Uses",
              items: [
                "Using the platform to engage in fraud, phishing, or deceptive practices.",
                "Manipulating product reviews, ratings, or search rankings.",
                "Circumventing or attempting to bypass any platform security measure.",
                "Harvesting or aggregating other users' personal information without consent.",
                "Using Andromeda to violate any applicable local, state, national, or international law.",
              ],
            },
            {
              title: "5. Intellectual Property",
              items: [
                "All platform content, design, code, trademarks, and logos are the exclusive property of Andromeda Technologies.",
                "You may not reproduce, distribute, or create derivative works from any Andromeda content without written permission.",
                "User-submitted content (reviews, product listings) remains your property. By submitting content, you grant Andromeda a non-exclusive, worldwide, royalty-free licence to display and distribute that content on the platform.",
              ],
            },
            {
              title: "6. Third-Party Links and Marketplaces",
              items: [
                "Andromeda aggregates product data from third-party marketplaces (Amazon, Flipkart, etc.) and redirects users to those platforms for purchase. We are not responsible for the content, policies, or practices of those third parties.",
                "Andromeda does not guarantee the accuracy of prices or availability shown for third-party products.",
                "Any transaction you complete on an external platform is governed by that platform's terms, not Andromeda's.",
              ],
            },
            {
              title: "7. Disclaimer of Warranties",
              items: [
                "Andromeda is provided on an 'as is' and 'as available' basis without warranties of any kind, either express or implied.",
                "We do not warrant that the platform will be uninterrupted, error-free, or completely secure.",
                "We make no guarantee about the accuracy, reliability, or completeness of any product information displayed.",
              ],
            },
            {
              title: "8. Limitation of Liability",
              items: [
                "To the maximum extent permitted by law, Andromeda Technologies shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.",
                "Our total liability to you for any claim arising from use of the platform shall not exceed ₹1,000 or the amount you paid to us in the last 12 months, whichever is greater.",
              ],
            },
            {
              title: "9. Termination",
              items: [
                "Andromeda may suspend or terminate your account at any time for violation of these Terms, with or without notice.",
                "You may delete your account at any time via Settings → Account → Delete Account.",
                "Upon termination, your right to use the platform ceases immediately.",
              ],
            },
            {
              title: "10. Governing Law & Disputes",
              items: [
                "These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Bengaluru, Karnataka.",
                "Before pursuing legal action, parties agree to first attempt good-faith resolution through Andromeda's support team.",
              ],
            },
            {
              title: "11. Changes to These Terms",
              items: [
                "We may update these Terms periodically. Continued use of Andromeda after changes take effect constitutes your acceptance of the revised Terms.",
                "Material changes will be notified via email to registered users and displayed prominently on the platform.",
              ],
            },
          ].map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-base font-bold text-primary border-b border-outline-variant pb-2">
                {section.title}
              </h2>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm text-on-surface-variant leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="bg-primary/5 rounded-xl border border-primary/20 p-5">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              For questions about these Terms, contact us at legal@andromeda.app. See also our{" "}
              <Link href="/privacy" className="text-secondary font-semibold hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/faq" className="text-secondary font-semibold hover:underline">
                FAQ
              </Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
