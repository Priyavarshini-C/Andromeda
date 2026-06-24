import React, { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, ShieldCheck } from "lucide-react";
import { PRODUCTS, getProductBySlug } from "@/lib/utils/mock-data";
import ProductDetailsClient from "@/components/product/ProductDetailsClient";
import type { Metadata } from "next";

export const unstable_instant = {
  prefetch: "static",
  samples: [
    { params: { slug: "nebula-x1-pro-smartphone" } },
  ],
};

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found — Andromeda",
    };
  }
  return {
    title: `${product.title} — Andromeda`,
    description: product.description.substring(0, 160),
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full animate-pulse flex-1 flex flex-col">
          <div className="h-4 w-24 bg-surface-container rounded mb-6" />
          <div className="h-[500px] bg-surface-container rounded-xl" />
        </div>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1 flex flex-col">
      {/* Breadcrumbs / Back button */}
      <div className="mb-6">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-on-surface-variant hover:text-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Explore
        </Link>
      </div>

      {/* Main product interactive block (Client Component) */}
      <ProductDetailsClient product={product} />

      {/* Specifications Grid */}
      <section className="mt-12 border-t border-outline-variant/30 pt-8">
        <h2 className="text-lg font-bold text-primary mb-4">
          Technical Specifications
        </h2>
        <div className="bg-surface-card rounded-xl border border-outline-variant overflow-hidden shadow-observatory max-w-3xl">
          <table className="w-full text-left border-collapse text-xs">
            <tbody>
              {Object.entries(product.specs || {}).map(([key, val], index) => (
                <tr
                  key={key}
                  className={`border-b border-outline-variant/30 last:border-b-0 ${
                    index % 2 === 0 ? "bg-surface-card" : "bg-surface-container/30"
                  }`}
                >
                  <td className="p-4 w-48 font-bold text-on-surface-variant/80 bg-surface-container/50">
                    {key}
                  </td>
                  <td className="p-4 font-semibold text-on-surface">
                    {val}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-12 border-t border-outline-variant/30 pt-8">
        <div className="max-w-3xl">
          <h2 className="text-lg font-bold text-primary mb-6">
            Customer Reviews ({product.reviews.length})
          </h2>
          
          <div className="flex flex-col gap-6">
            {product.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-surface-card rounded-xl border border-outline-variant p-5 shadow-observatory flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">{rev.userName}</span>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-success/15 px-2 py-0.5 text-[9px] font-bold text-success uppercase tracking-wider">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">{rev.date}</span>
                </div>
                
                {/* Review Stars */}
                <div className="flex items-center gap-0.5 text-tertiary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < rev.rating ? "fill-current" : "text-outline-variant"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-on-surface-variant font-medium">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
