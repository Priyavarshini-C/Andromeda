// =============================================================================
// Andromeda — Contact Us Page
// =============================================================================

"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, CheckCircle2 } from "lucide-react";

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    title: "Email Support",
    desc: "For general inquiries and platform support",
    value: "support@andromeda.app",
    href: "mailto:support@andromeda.app",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Phone,
    title: "Phone",
    desc: "Monday–Friday, 9:00 AM – 6:00 PM IST",
    value: "+91 80 1234 5678",
    href: "tel:+918012345678",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: MessageSquare,
    title: "Seller Support",
    desc: "Dedicated support for registered sellers",
    value: "sellers@andromeda.app",
    href: "mailto:sellers@andromeda.app",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    icon: MapPin,
    title: "Headquarters",
    desc: "Visit our office (by appointment only)",
    value: "Bengaluru, Karnataka, India",
    href: "#",
    color: "text-error",
    bg: "bg-error/10",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission — wire to email API in production
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero */}
      <section className="gradient-hero text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl" />
        <div className="mx-auto max-w-3xl text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/20 px-3.5 py-1 text-xs font-semibold text-secondary-container uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5" />
            Get in Touch
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            We&apos;d Love to Hear From You
          </h1>
          <p className="mt-4 text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Questions about the platform, seller partnerships, or press inquiries — our team
            responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Channels */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CONTACT_CHANNELS.map((ch) => (
            <a
              key={ch.title}
              href={ch.href}
              className="flex flex-col gap-3 p-5 rounded-xl border border-outline-variant bg-surface-card shadow-observatory hover:shadow-observatory-lifted hover:border-secondary/30 transition-all group"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${ch.bg} ${ch.color} group-hover:scale-110 transition-transform`}
              >
                <ch.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">{ch.title}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{ch.desc}</p>
                <p className="text-xs font-semibold text-secondary mt-1.5">{ch.value}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-surface-card rounded-xl border border-outline-variant p-6 shadow-observatory">
              <h2 className="text-lg font-bold text-primary mb-1">Send a Message</h2>
              <p className="text-xs text-on-surface-variant mb-6">
                Fill out the form and we&apos;ll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-primary">Message Sent!</h3>
                  <p className="text-sm text-on-surface-variant max-w-xs">
                    Thank you for reaching out. Our team will review your message and respond within
                    24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="text-xs font-bold text-secondary hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Your name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Subject</label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                    >
                      <option value="">Select a subject...</option>
                      <option value="general">General Inquiry</option>
                      <option value="seller">Seller Partnership</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing</option>
                      <option value="press">Press & Media</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1.5">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Describe your question or issue..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-white px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Info */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-surface-card rounded-xl border border-outline-variant p-5 shadow-observatory">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-secondary" />
                <h3 className="text-sm font-bold text-primary">Response Times</h3>
              </div>
              <ul className="space-y-2 text-xs text-on-surface-variant">
                <li className="flex items-center justify-between">
                  <span>General Inquiries</span>
                  <span className="font-bold text-success">Within 24 hours</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Technical Support</span>
                  <span className="font-bold text-tertiary">4–8 hours</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Seller Partnerships</span>
                  <span className="font-bold text-secondary">48 hours</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Press & Media</span>
                  <span className="font-bold text-primary">2 business days</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-primary to-primary-container rounded-xl p-5 text-white">
              <h3 className="text-sm font-bold mb-2">Are you a seller?</h3>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                Join thousands of businesses already reaching more customers on Andromeda. Our seller
                support team is dedicated to helping you grow.
              </p>
              <Link
                href="/seller"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-primary px-4 py-2 text-xs font-bold hover:bg-white/90 transition-colors"
              >
                Join as a Seller
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
