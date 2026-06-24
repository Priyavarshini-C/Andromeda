// =============================================================================
// Andromeda — AI Product Assistant API
// POST /api/ai/chat
// Provides context-aware product recommendations via streaming text response
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, sellers } from "@/lib/db/schema";
import { eq, ilike, or, and, sql } from "drizzle-orm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Simple intent classifier & product fetcher
// ---------------------------------------------------------------------------
async function getRelevantProducts(userMessage: string) {
  const lower = userMessage.toLowerCase();

  // Extract price intent
  const priceMatch = lower.match(/under\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/i);
  const maxPrice = priceMatch
    ? parseFloat(priceMatch[1].replace(/,/g, ""))
    : undefined;

  // Broad keyword match
  const keywords = lower
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["what","find","show","good","best","looking"].includes(w));

  if (keywords.length === 0) return [];

  try {
    const conditions = keywords.slice(0, 3).map((kw) =>
      or(
        ilike(products.title, `%${kw}%`),
        ilike(products.brand, `%${kw}%`),
        ilike(products.tags, `%${kw}%`)
      )
    );

    const query = db
      .select({
        id: products.id,
        title: products.title,
        price: products.price,
        originalPrice: products.originalPrice,
        brand: products.brand,
        rating: products.rating,
        stock: products.stock,
        thumbnailUrl: products.thumbnailUrl,
        slug: products.slug,
        sellerName: sellers.businessName,
      })
      .from(products)
      .leftJoin(sellers, eq(products.sellerId, sellers.id))
      .where(
        and(
          eq(products.status, "active"),
          or(...conditions) as any
        )
      )
      .limit(5);

    const results = await query;

    return maxPrice
      ? results.filter((p) => p.price <= maxPrice)
      : results;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Build AI response (deterministic, no external LLM required)
// ---------------------------------------------------------------------------
async function buildAssistantResponse(
  userMessage: string,
  history: Message[]
): Promise<string> {
  const lower = userMessage.toLowerCase();

  // Greetings
  if (/^(hi|hello|hey|yo|good morning|good evening)\b/.test(lower)) {
    return "Hey there! 👋 I'm Andromeda's AI shopping assistant. I can help you find products, compare prices, and discover the best deals. What are you looking for today?";
  }

  // Capabilities
  if (/what can you do|help|capabilities/.test(lower)) {
    return `I can help you with:
- 🔍 **Finding products** — just tell me what you need (e.g. "show me wireless earphones")
- 💰 **Price filters** — "earphones under ₹2000"
- ⭐ **Recommendations** — "best rated laptops"
- 📊 **Comparisons** — "compare iPhone vs Samsung"
- 🏪 **Store discovery** — "stores near me with electronics"

What would you like to explore?`;
  }

  // Product search
  const relevantProducts = await getRelevantProducts(userMessage);

  if (relevantProducts.length > 0) {
    const productList = relevantProducts
      .map((p, i) => {
        const discount =
          p.originalPrice && p.originalPrice > p.price
            ? ` ~~₹${p.originalPrice.toLocaleString("en-IN")}~~`
            : "";
        const stars = "⭐".repeat(Math.round(p.rating || 0));
        return `**${i + 1}. ${p.title}**
   💰 ₹${p.price.toLocaleString("en-IN")}${discount}
   ${stars || "⭐"} ${p.rating?.toFixed(1) || "N/A"} | 🏪 ${p.sellerName || "Andromeda Seller"}
   ${p.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"} | [View Product](/products/${p.slug})`;
      })
      .join("\n\n");

    return `Here's what I found for **"${userMessage}"**:\n\n${productList}\n\n---\n💡 *Tip: Add items to your cart or wishlist for quick access!*`;
  }

  // Comparison request
  if (/compar|vs|versus|difference/.test(lower)) {
    return `To compare products, you can use our **Compare Tool** at [/compare](/compare). Add any products you're interested in and see a side-by-side breakdown of specs, price, and ratings. Want me to find specific products for you to compare?`;
  }

  // Price related
  if (/price|cost|cheap|expensive|budget|afford/.test(lower)) {
    return `I couldn't find specific products matching your query. Try being more specific, like:\n- "wireless earphones under ₹1500"\n- "gaming keyboard budget"\n- "best smartphone under ₹20000"\n\nWhat category are you interested in?`;
  }

  // Category browsing
  if (/electronics|fashion|furniture|phone|laptop|camera/.test(lower)) {
    const categorySlug = lower.includes("electronics") ? "electronics"
      : lower.includes("phone") ? "smartphones"
      : lower.includes("laptop") ? "laptops"
      : lower.includes("camera") ? "cameras"
      : "electronics";

    return `You can browse all products in that category at [/products?category=${categorySlug}](/products?category=${categorySlug}). I can also search for specific items — just tell me more about what you need!`;
  }

  // Fallback
  return `I couldn't find products matching **"${userMessage}"** at the moment. Here are some things you can try:
  
- 🔍 Search on the [products page](/products)
- 📂 Browse [all categories](/products)
- 🏪 Explore [local stores](/stores)
- 💬 Rephrase your query (e.g. "show me budget headphones")

Is there anything else I can help you with?`;
}

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [] } = body as {
      message: string;
      history: Message[];
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
    }

    const reply = await buildAssistantResponse(message.trim(), history);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("POST /api/ai/chat error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
