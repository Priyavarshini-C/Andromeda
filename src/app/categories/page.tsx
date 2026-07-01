// =============================================================================
// Andromeda — Premium Category Catalog Browse Page (Rose Gold Overhaul)
// =============================================================================

import React, { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { Tag, Sparkles, Flame, ChevronRight, Compass } from "lucide-react";

// Predefined editorial banner backgrounds for categories
const CATEGORY_STYLES: Record<string, { bg: string; text: string; iconBg: string }> = {
  electronics: {
    bg: "bg-[#1C1410] border-[#E8D8CE]",
    text: "text-ivory",
    iconBg: "bg-[#2E1F16]"
  },
  fashion: {
    bg: "bg-[#FDF0EB] border-[#E8D8CE]",
    text: "text-charcoal",
    iconBg: "bg-[#FAF6F2]"
  },
  books: {
    bg: "bg-[#FAF6F2] border-[#E8D8CE]",
    text: "text-charcoal",
    iconBg: "bg-white"
  },
  home: {
    bg: "bg-[#1C1410] border-l-4 border-l-[#C07840]",
    text: "text-ivory",
    iconBg: "bg-[#2E1F16]"
  }
};

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-xs text-smoke font-light">Loading categories catalog...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}

async function CategoriesContent() {
  // Query categories from DB
  const dbCategories = await db.select().from(categories);

  // Map database categories with styling rules
  const displayCategories = dbCategories.map((c: any) => {
    const slug = c.slug.toLowerCase();
    const style = CATEGORY_STYLES[slug] || {
      bg: "bg-[#FAF6F2] border-[#E8D8CE]",
      text: "text-charcoal",
      iconBg: "bg-white"
    };

    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || "Discover premium calibrated indices for this catalog class.",
      ...style
    };
  });

  return (
    <div className="w-full bg-[#FAF6F2] text-charcoal min-h-screen">
      
      {/* ── Editorial Header Hero ── */}
      <div 
        className="bg-[#0E0A09] text-white py-16 px-6 md:px-12 text-center relative overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(rgba(200,120,64,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0E0A09]/50 to-[#0E0A09] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="text-[10px] font-sans font-light tracking-[3px] uppercase text-[#E8C99A]">
            Curated Catalogs
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-normal italic text-[#FAF6F2]">
            Browse *Collections*
          </h1>
          <p className="text-xs text-smoke font-light tracking-wide max-w-md mx-auto leading-relaxed">
            Delve into custom curated categories of premium verified goods and direct shipping indices.
          </p>
        </div>
      </div>

      {/* ── Main Catalog Grid ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left/Main Column: Grid Cards (Span 8) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-2 border-b border-[#E8D8CE] pb-3">
            <Compass className="h-4.5 w-4.5 text-rose" />
            <h2 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal">
              Atelier Collections Index
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {displayCategories.map((cat: any) => (
              <Link 
                key={cat.id}
                href={`/products?categoryId=${cat.id}`}
                className={`group p-6 rounded-xl border transition-all duration-300 shadow-luxury-light hover:shadow-luxury-dark hover:scale-[1.02] flex flex-col justify-between h-48 ${cat.bg} ${cat.text}`}
              >
                <div>
                  <div className={`h-9 w-9 rounded-full ${cat.iconBg} flex items-center justify-center border border-[#E8D8CE]/40 mb-4 text-[#C07840]`}>
                    <Tag className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider group-hover:text-[#C4607A] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-light leading-relaxed mt-2 text-smoke line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[#C4607A] group-hover:text-[#8B3A52] transition-colors mt-4 self-end">
                  Explore Catalog <ChevronRight className="h-3 w-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Panel: Category Features & Offers (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Limited Deals Board */}
          <div className="bg-ivory border border-[#E8D8CE] rounded-xl p-6 shadow-luxury-light">
            <div className="flex items-center gap-2 border-b border-[#E8D8CE] pb-3 mb-4">
              <Flame className="h-4.5 w-4.5 text-[#C07840] animate-pulse" />
              <h3 className="text-xs uppercase tracking-[2px] font-semibold text-charcoal">
                Limited Time Deals
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 p-3 bg-[#FDF0EB] border border-[#E8D8CE] rounded">
                <div className="min-w-0">
                  <span className="bg-[#8B3A52] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    25% OFF
                  </span>
                  <p className="text-xs font-semibold text-charcoal mt-1.5 truncate">Fountain Pen Series</p>
                </div>
                <Link 
                  href="/products/instrument-fountain-pen"
                  className="shrink-0 text-[10px] font-bold text-[#C4607A] hover:underline"
                >
                  View
                </Link>
              </div>

              <div className="flex items-center justify-between gap-2 p-3 bg-[#E1F5EE] border border-[#E8D8CE] rounded">
                <div className="min-w-0">
                  <span className="bg-[#085041] text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Lowest Rate
                  </span>
                  <p className="text-xs font-semibold text-charcoal mt-1.5 truncate">Minimalist Notebooks</p>
                </div>
                <Link 
                  href="/products/minimalist-journal"
                  className="shrink-0 text-[10px] font-bold text-[#C4607A] hover:underline"
                >
                  View
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Quality Guarantee Banner */}
          <div className="bg-[#2E1F16] border-l-4 border-l-[#C07840] rounded-xl p-6 shadow-luxury-dark text-white relative overflow-hidden">
            <div className="relative z-10 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-[#C07840] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs uppercase tracking-[2px] font-semibold text-[#E8C99A]">
                  Verified Calibrations
                </h4>
                <p className="text-[11px] leading-relaxed italic mt-2 text-[#FAF6F2] font-light">
                  All listings under these classifications undergo direct seller validation for shipping speed and authenticity logs.
                </p>
              </div>
            </div>
            
            {/* Subtle background circular mask */}
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          </div>

        </div>

      </div>

    </div>
  );
}
