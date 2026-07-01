// =============================================================================
// Andromeda — Premium Nearby Local Discovery (Rose Gold Overhaul)
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin, Star, Phone, ShieldCheck, Search, SlidersHorizontal,
  Navigation, Store, ChevronDown, ExternalLink, Package, Map, List
} from "lucide-react";
import { useLocationStore } from "@/store/location.store";
import { motion } from "framer-motion";

const StoresMap = dynamic(() => import("@/components/stores/StoresMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-xl border border-[#E8D8CE] bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-[#8B3A52]/30 border-t-[#8B3A52] rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-smoke font-light">Loading discovery map…</p>
      </div>
    </div>
  ),
});

interface StoreItem {
  id: string;
  businessName: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  productCount: number;
  latitude: number | null;
  longitude: number | null;
  businessHours: Record<string, string>;
  distanceKm: number | null;
}

function getOpenStatus(hours: Record<string, string>): {
  isOpen: boolean;
  label: string;
} {
  const now = new Date();
  const day = now.getDay();
  const dayMap: Record<number, string[]> = {
    0: ["sun", "sunday"],
    1: ["mon", "monday", "mon-sat", "mon-fri"],
    2: ["tue", "tuesday", "mon-sat", "mon-fri"],
    3: ["wed", "wednesday", "mon-sat", "mon-fri"],
    4: ["thu", "thursday", "mon-sat", "mon-fri"],
    5: ["fri", "friday", "mon-sat", "mon-fri"],
    6: ["sat", "saturday", "mon-sat"],
  };

  const possibleKeys = dayMap[day] || [];
  for (const key of possibleKeys) {
    const val = hours[key];
    if (!val) continue;
    if (val.toLowerCase() === "closed") return { isOpen: false, label: "Closed today" };

    const [openTime, closeTime] = val.split("-");
    if (openTime && closeTime) {
      const [oh, om] = openTime.split(":").map(Number);
      const [ch, cm] = closeTime.split(":").map(Number);
      const currentMin = now.getHours() * 60 + now.getMinutes();
      const openMin = oh * 60 + (om || 0);
      const closeMin = ch * 60 + (cm || 0);

      if (currentMin >= openMin && currentMin < closeMin) {
        return { isOpen: true, label: `Open until ${closeTime}` };
      } else if (currentMin < openMin) {
        return { isOpen: false, label: `Opens at ${openTime}` };
      } else {
        return { isOpen: false, label: "Closed for today" };
      }
    }
  }
  return { isOpen: true, label: "Open hours unspecified" };
}

export default function StoresPage() {
  const { latitude, longitude, isDetecting, detectLocation } = useLocationStore();
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "name">("rating");
  const [radius, setRadius] = useState<number>(50); // Default 50 km
  const [minRating, setMinRating] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Fetch local stores from endpoint
  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (latitude) params.append("lat", latitude.toString());
      if (longitude) params.append("lng", longitude.toString());
      params.append("radius", radius.toString());
      if (searchQuery) params.append("q", searchQuery);

      const res = await fetch(`/api/stores?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        let list: StoreItem[] = data.data || [];

        // Apply client side filters
        if (minRating > 0) {
          list = list.filter((s) => s.rating >= minRating);
        }

        // Apply client side sorting
        list.sort((a, b) => {
          if (sortBy === "distance" && a.distanceKm !== null && b.distanceKm !== null) {
            return a.distanceKm - b.distanceKm;
          }
          if (sortBy === "rating") {
            return b.rating - a.rating;
          }
          return a.businessName.localeCompare(b.businessName);
        });

        setStores(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, radius, searchQuery, sortBy, minRating]);

  useEffect(() => {
    setTimeout(() => {
      fetchStores();
    }, 0);
  }, [fetchStores]);

  const handleDetectLocation = () => {
    detectLocation();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full bg-[#FAF6F2] text-charcoal flex-grow">
      
      {/* ── Page Header ── */}
      <div className="mb-8 border-b border-[#E8D8CE] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-sans font-light tracking-[3px] uppercase text-smoke">
            Nearby Local Discovery
          </span>
          <h1 className="text-3xl font-sans font-medium text-charcoal mt-1">
            Local Store Directory
          </h1>
          <p className="mt-1 text-sm text-smoke font-light">
            Discover and support independent local sellers near your current coordinate hub.
          </p>
        </div>

        {/* Location Detection Actions */}
        <button
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="border border-[#C4607A] text-[#C4607A] hover:bg-[#FAF6F2] hover:border-[#8B3A52] rounded px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <Navigation className={`h-4.5 w-4.5 text-[#8B3A52] ${isDetecting ? "animate-spin" : ""}`} />
          {isDetecting ? "Detecting Coordinates…" : "Use My Location"}
        </button>
      </div>

      {/* ── Search & Filter Panel ── */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-smoke" />
          <input
            type="text"
            placeholder="Search stores by business name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#E8D8CE] bg-white rounded text-xs text-charcoal placeholder:text-smoke/50 focus:outline-none focus:ring-2 focus:ring-[#C4607A] focus:border-[#C4607A] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "distance" | "rating" | "name")}
              className="appearance-none rounded border border-[#E8D8CE] bg-white px-3 py-2.5 pr-8 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-[#C4607A] cursor-pointer"
            >
              {latitude && <option value="distance">Sort by Distance</option>}
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-smoke pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded border text-xs font-semibold transition-colors cursor-pointer ${
              showFilters
                ? "border-[#8B3A52] bg-[#8B3A52]/10 text-[#8B3A52]"
                : "border-[#E8D8CE] bg-white text-charcoal hover:bg-[#F5EDE4]"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>

          {/* List / Map Switcher Toggle */}
          <div className="flex rounded border border-[#E8D8CE] overflow-hidden bg-white">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-[#1C1410] text-[#FAF6F2]"
                  : "text-smoke hover:bg-parchment"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "map"
                  ? "bg-[#1C1410] text-[#FAF6F2]"
                  : "text-smoke hover:bg-parchment"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Expanded filters options */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-[#E8D8CE] bg-ivory p-4 animate-in fade-in duration-150 shadow-luxury-light">
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="text-[10px] font-semibold text-smoke uppercase tracking-wider block mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-1.5">
                {[0, 3, 3.5, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                      minRating === r
                        ? "bg-[#1C1410] text-[#FAF6F2]"
                        : "bg-[#FDF0EB] text-[#8A7D76] border border-[#E8D8CE] hover:bg-[#FAF6F2]"
                    }`}
                  >
                    {r === 0 ? "All" : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            {latitude && (
              <div>
                <label className="text-[10px] font-semibold text-smoke uppercase tracking-wider block mb-2">
                  Search Radius Limit
                </label>
                <div className="flex gap-1.5">
                  {[10, 25, 50, 100, 5000].map((d) => (
                    <button
                      key={d}
                      onClick={() => setRadius(d)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                        radius === d
                          ? "bg-[#1C1410] text-[#FAF6F2]"
                          : "bg-[#FDF0EB] text-[#8A7D76] border border-[#E8D8CE] hover:bg-[#FAF6F2]"
                      }`}
                    >
                      {d >= 5000 ? "Global" : `${d} km`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map View Frame */}
      {viewMode === "map" && (
        <div 
          className="mb-8 h-[480px] rounded-xl border border-[#E8D8CE] overflow-hidden bg-[#1C1410] relative shadow-luxury-dark"
          style={{
            backgroundImage: "radial-gradient(rgba(192,120,64,0.18) 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px"
          }}
        >
          <StoresMap
            stores={stores
              .filter(s => s.latitude !== null && s.longitude !== null)
              .map(s => ({
                id: s.id,
                businessName: s.businessName,
                latitude: s.latitude!,
                longitude: s.longitude!,
                rating: s.rating,
                isVerified: s.isVerified,
                address: s.address,
                city: s.city,
                slug: s.slug,
              }))
            }
            userLat={latitude}
            userLng={longitude}
          />
        </div>
      )}

      {/* Store Listings Grid */}
      {viewMode === "list" && loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#E8D8CE] bg-white p-5 animate-pulse"
            >
              <div className="flex gap-3 mb-3">
                <div className="h-12 w-12 rounded bg-zinc-200" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-zinc-200 rounded mb-2" />
                  <div className="h-3 w-20 bg-zinc-200 rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-zinc-200 rounded mb-2" />
              <div className="h-3 w-3/4 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      ) : viewMode === "list" && stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-[#E8D8CE] border-dashed rounded-xl">
          <Store className="h-16 w-16 text-[#E8D8CE] mb-4" />
          <h3 className="text-base font-semibold text-charcoal mb-1">No merchant ateliers found</h3>
          <p className="text-xs text-smoke max-w-sm font-light">
            Try resetting your range limits, checking coordinates, or clearing text parameters.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const openStatus = getOpenStatus(store.businessHours);
            return (
              <motion.div
                key={store.id}
                whileHover={{ y: -4, borderColor: "#C07840" }}
                className="group rounded-xl border border-[#E8D8CE] bg-ivory shadow-luxury-light hover:shadow-luxury-dark transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    {/* Store Avatar */}
                    <div className="h-11 w-11 rounded bg-[#2E1F16] flex items-center justify-center text-[#E8C99A] font-bold text-lg border border-[rgba(200,120,64,0.18)] shrink-0">
                      {store.businessName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-charcoal truncate">
                          {store.businessName}
                        </h3>
                        {store.isVerified && (
                          <ShieldCheck className="h-4 w-4 text-[#1D9E75] shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-goldmist fill-current" />
                          <span className="text-[11px] font-semibold text-charcoal">
                            {store.rating.toFixed(1)}
                          </span>
                        </div>
                        {store.distanceKm !== null && (
                          <>
                            <span className="text-[#E8D8CE]">·</span>
                            <span className="bg-[#F0E0D4] text-[#8A7D76] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {store.distanceKm < 1
                                ? `${Math.round(store.distanceKm * 1000)}m`
                                : `${store.distanceKm.toFixed(1)} km`}
                            </span>
                          </>
                        )}
                        <span className="text-[#E8D8CE]">·</span>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            openStatus.isOpen ? "bg-[#E1F5EE] text-[#085041]" : "bg-[#F0E0D4] text-[#8A7D76]"
                          }`}
                        >
                          {openStatus.isOpen ? "Open Now" : "Closed"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {store.description && (
                    <p className="text-xs text-smoke leading-relaxed mb-4 line-clamp-2 font-light">
                      {store.description}
                    </p>
                  )}

                  {/* Info Details */}
                  <div className="space-y-1.5 text-[11px] text-smoke font-light pt-3 border-t border-[#E8D8CE]/40">
                    {store.address && (
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-[#8B3A52] shrink-0" />
                        <span className="truncate">
                          {store.address}{store.city && `, ${store.city}`}
                        </span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-[#8B3A52] shrink-0" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-[#E8D8CE]/60 bg-[#FAF6F2] flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-smoke font-semibold flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" />
                    {store.productCount} Products
                  </span>
                  <Link
                    href={`/products?sellerId=${store.id}`}
                    className="text-xs font-semibold text-[#C4607A] hover:text-[#8B3A52] transition-colors flex items-center gap-0.5"
                  >
                    View Catalog <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
