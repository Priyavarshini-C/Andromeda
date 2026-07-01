// =============================================================================
// Andromeda — Premium "Rose Gold" Overhaul Landing Page
// =============================================================================

"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { 
  Laptop, BookOpen, Home, Shirt, ArrowRight, Gem, Store, 
  Search, Shield, CheckCircle, RefreshCw, Zap
} from "lucide-react";
import { fadeUp, containerVariants, itemVariants } from "@/utils/animations";
import BlurText from "@/components/BlurText";
import FadingVideo from "@/components/FadingVideo";

const PARTNERS = ["Amazon", "Flipkart", "Myntra", "Meesho", "Etsy"];

const TRENDING_CATEGORIES = [
  { name: "Electronics", slug: "electronics", icon: Laptop, count: "4,210 items" },
  { name: "Fashion", slug: "fashion", icon: Shirt, count: "8,940 items" },
  { name: "Home Living", slug: "home-kitchen", icon: Home, count: "3,110 items" },
  { name: "Books", slug: "books", icon: BookOpen, count: "1,840 items" },
  { name: "Audio", slug: "electronics", icon: Laptop, count: "920 items" },
  { name: "Stationery", slug: "books", icon: BookOpen, count: "420 items" },
  { name: "Boutique", slug: "fashion", icon: Shirt, count: "1,110 items" },
  { name: "Artisanal", slug: "home-kitchen", icon: Home, count: "670 items" },
];

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: "One Search",
    desc: "Enter any product. Our engine queries dozens of national e-commerce systems, regional boutiques, and local ateliers in under 100ms."
  },
  {
    icon: Shield,
    title: "Verified Comparison",
    desc: "Compare base rates, shipping estimates, and seller ratings side-by-side. Uncover hidden savings without corporate sponsorships."
  },
  {
    icon: Store,
    title: "Support Local Ateliers",
    desc: "We promote physical regional merchants directly in your city. Select click-and-collect options to purchase instantly near you."
  }
];

interface TestimonialWordProps {
  word: string;
  idx: number;
  totalWords: number;
  scrollProgress: MotionValue<number>;
}

function TestimonialWord({ word, idx, totalWords, scrollProgress }: TestimonialWordProps) {
  const start = (idx / totalWords) * 0.6;
  const end = start + 0.1;
  const wordOpacity = useTransform(scrollProgress, [start, end], [0.15, 1]);
  const wordColor = useTransform(scrollProgress, [start, end], ["#8A7D76", "#FAF6F2"]);

  return (
    <motion.span
      style={{ opacity: wordOpacity, color: wordColor }}
      className="text-2xl md:text-4xl font-sans font-medium tracking-tight"
    >
      {word}
    </motion.span>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);

  // Parallax Hero effect
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  // Testimonial word scroll-driven reveal
  const { scrollYProgress: testScrollProgress } = useScroll({
    target: testimonialRef,
    offset: ["start end", "end start"]
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const testimonialText = "Andromeda redefined how we browse. We discovered verified local stores in our neighborhood that sold the exact premium products we needed, at prices that beat national giants. It is simple, authentic luxury.";
  const testimonialWords = testimonialText.split(" ");

  return (
    <div className="flex flex-col w-full bg-[#0E0A09] overflow-x-hidden">
      
      {/* ── SECTION 1: HERO (Obsidian Canvas) ── */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#0E0A09] z-10"
      >
        {/* Cinematic Molten Gold / Embers Video Layer */}
        <FadingVideo 
          src="https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-molten-gold-48416-large.mp4"
          className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none opacity-40 mix-blend-screen"
        />

        {/* Top spacing for the floating navbar */}
        <div className="h-28" />

        {/* Hero content */}
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto flex-1"
        >
          {/* Tag Pill */}
          <motion.div 
            {...fadeUp(0.1, 10)}
            className="liquid-glass rounded-full px-4 py-2 mb-8 inline-flex items-center gap-2"
          >
            <span className="bg-[#8B3A52] text-[#FAF6F2] rounded-md text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
              NEW
            </span>
            <span className="text-xs text-[#E8C99A]/80 font-sans tracking-wide">
              Discover every product. Compare in seconds.
            </span>
          </motion.div>

          {/* Headline */}
          <BlurText 
            text="Your Universe of *Products.*"
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium tracking-[-2px] text-[#FAF6F2] leading-[1.0] max-w-4xl mx-auto font-sans"
          />

          {/* Subtitle */}
          <motion.p 
            {...fadeUp(0.4)}
            className="text-base md:text-lg text-[#E8C99A]/80 max-w-2xl mx-auto mt-6 mb-8 font-normal leading-8 tracking-wide"
          >
            Search once across every marketplace, local shop, and independent seller. 
            Compare prices. Make confident decisions.
          </motion.p>

          {/* Search Bar */}
          <motion.form 
            {...fadeUp(0.5)}
            onSubmit={handleSearchSubmit}
            className="liquid-glass rounded-full p-2 max-w-xl w-full mx-auto flex items-center shadow-luxury-dark border border-[#E8C99A]/10"
          >
            <input 
              type="text" 
              placeholder="Search products, brands, or local boutiques..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[#FAF6F2] placeholder:text-[#E8C99A]/40 flex-1 pl-6 outline-none font-sans text-sm"
            />
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.97 }} 
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="bg-[#8B3A52] text-[#FAF6F2] rounded-full px-8 py-3.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#C4607A] transition-colors cursor-pointer"
            >
              Search
            </motion.button>
          </motion.form>

          {/* Stat Cards */}
          <motion.div 
            {...fadeUp(0.6)}
            className="flex gap-6 mt-12 justify-center flex-wrap"
          >
            <div className="liquid-glass rounded-[1.25rem] p-6 w-[200px] text-left flex flex-col justify-between h-[130px]">
              <Gem className="h-6 w-6 text-goldmist" />
              <div>
                <p className="font-serif italic text-3xl text-ivory">10M+</p>
                <p className="text-[10px] text-[#E8C99A]/60 uppercase tracking-widest font-sans mt-1">Products Indexed</p>
              </div>
            </div>
            <div className="liquid-glass rounded-[1.25rem] p-6 w-[200px] text-left flex flex-col justify-between h-[130px]">
              <Store className="h-6 w-6 text-goldmist" />
              <div>
                <p className="font-serif italic text-3xl text-ivory">50K+</p>
                <p className="text-[10px] text-[#E8C99A]/60 uppercase tracking-widest font-sans mt-1">Sellers &amp; Shops</p>
              </div>
            </div>
          </motion.div>

          {/* Partner strip */}
          <motion.div 
            {...fadeUp(0.7)}
            className="flex flex-col items-center gap-6 mt-16 pb-12 w-full"
          >
            <div className="liquid-glass rounded-full px-5 py-1.5 text-[10px] uppercase tracking-[2px] text-[#E8C99A]/70 font-sans">
              Trusted by top sellers across India
            </div>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-3 mt-2">
              {PARTNERS.map((partner, idx) => (
                <span 
                  key={idx}
                  className="font-serif italic text-[#E8C99A] text-xl tracking-wider opacity-85 hover:opacity-100 transition-opacity cursor-default"
                >
                  {partner}
                </span>
              ))}
            </div>
          </motion.div>

        </motion.div>

        {/* Bottom Fade Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0E0A09] to-transparent z-10 pointer-events-none" />
      </section>

      {/* ── SECTION 2: TRENDING CATEGORIES (Parchment Canvas) ── */}
      <section className="py-28 bg-[#F5EDE4] relative z-20 text-charcoal px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          
          <motion.div 
            {...fadeUp(0.1)}
            className="mb-12"
          >
            <span className="text-[10px] font-sans font-light tracking-[3px] uppercase text-smoke block mb-2">
              Trending Right Now
            </span>
            <h2 className="text-4xl md:text-5xl font-medium font-sans text-charcoal tracking-tight">
              Shop by Category
            </h2>
          </motion.div>

          {/* Horizontal scroll container */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex gap-6 overflow-x-auto no-scrollbar pb-6"
          >
            {TRENDING_CATEGORIES.map((cat, idx) => {
              const IconComponent = cat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4, borderColor: "#C07840" }}
                  onClick={() => router.push(`/products?category=${cat.slug}`)}
                  className="w-[160px] h-[200px] shrink-0 bg-ivory border border-[#E8D8CE] rounded-[12px] p-5 flex flex-col justify-between shadow-luxury-light cursor-pointer transition-all duration-300 group"
                >
                  <div className="h-12 w-12 rounded-full bg-[#F0E0D4] flex items-center justify-center text-rose group-hover:scale-105 transition-transform duration-300">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-charcoal font-sans">{cat.name}</h3>
                    <p className="text-[11px] text-smoke mt-1 font-light">{cat.count}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS (Ivory Canvas) ── */}
      <section className="py-32 bg-ivory relative z-20 text-charcoal px-6 md:px-12 border-t border-[#E8D8CE]">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-20">
            <span className="text-[10px] font-sans font-light tracking-[3px] uppercase text-smoke block mb-2">
              Unified Search Ecosystem
            </span>
            <h2 className="text-4xl font-medium tracking-tight text-charcoal">
              How Andromeda Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {HOW_IT_WORKS.map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={idx}
                  {...fadeUp(idx * 0.12)}
                  className="flex flex-col items-center text-center p-6"
                >
                  <div className="h-16 w-16 rounded-full bg-[#F0E0D4] flex items-center justify-center text-rose mb-6">
                    <StepIcon className="h-6 w-6" />
                  </div>
                  <h3 className="font-sans font-semibold text-lg text-charcoal mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm font-normal leading-7 text-smoke">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 4: TESTIMONIAL SCROLL REVEAL (Dark Obsidian Canvas) ── */}
      <section 
        ref={testimonialRef}
        className="py-32 bg-[#0E0A09] min-h-[85vh] flex flex-col justify-center relative z-20 px-6 md:px-12 border-t border-[rgba(200,120,64,0.15)]"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          
          {/* Quote Icon */}
          <span className="text-[#C07840]/40 text-5xl font-serif block mb-8 cursor-default">
            &ldquo;
          </span>

          {/* Testimonial Word Flow Reveal */}
          <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-3 max-w-3xl">
            {testimonialWords.map((word, idx) => (
              <TestimonialWord
                key={idx}
                word={word}
                idx={idx}
                totalWords={testimonialWords.length}
                scrollProgress={testScrollProgress}
              />
            ))}
          </div>

          {/* Author info */}
          <div className="mt-16 flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-full border-2 border-rose bg-ember overflow-hidden">
              <div className="h-full w-full bg-[#FAF6F2]/10 flex items-center justify-center font-bold text-[#E8C99A]">
                AD
              </div>
            </div>
            <h4 className="text-[#FAF6F2] font-semibold text-base font-sans mt-2">
              Ananya Deshmukh
            </h4>
            <p className="text-[#E8C99A]/60 text-xs uppercase tracking-widest font-sans">
              Verified Patron · Mumbai
            </p>
          </div>

        </div>
      </section>

    </div>
  );
}
