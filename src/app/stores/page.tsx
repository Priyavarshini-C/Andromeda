// =============================================================================
// Andromeda — Local Stores Directory Page
// =============================================================================

"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  Globe,
  BadgeCheck,
  Search,
  SlidersHorizontal,
  Navigation,
  Store,
  ChevronDown,
  ExternalLink,
  Package,
  Map,
  List,
} from "lucide-react";
import { useLocationStore } from "@/store/location.store";

// Dynamically import map to avoid SSR issues with Leaflet
const StoresMap = dynamic(() => import("@/components/stores/StoresMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[480px] rounded-xl border border-outline-variant/20 bg-surface-card flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-on-surface-variant">Loading map…</p>
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
  const day = now.getDay(); // 0=Sun
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
        return { isOpen: false, label: "Closed now" };
      }
    }
  }

  return { isOpen: false, label: "Hours unavailable" };
}

export default function StoresPage() {
  const { latitude, longitude, city, detectLocation, isDetecting } =
    useLocationStore();

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "rating" | "name">("distance");
  const [minRating, setMinRating] = useState(0);
  const [radius, setRadius] = useState(5000); // Default 5000km to show all stores
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (latitude && longitude) {
        params.set("lat", String(latitude));
        params.set("lng", String(longitude));
        params.set("radius", String(radius));
      }
      if (searchQuery) params.set("q", searchQuery);
      if (minRating > 0) params.set("minRating", String(minRating));
      params.set("sortBy", latitude && longitude ? sortBy : "rating");
      params.set("pageSize", "50");

      const res = await fetch(`/api/stores?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStores(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, searchQuery, sortBy, minRating, radius]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleDetect = async () => {
    await detectLocation();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-1">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-tertiary to-tertiary/70 text-white shadow-lg">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
              Local Stores
            </h1>
            <p className="text-sm text-on-surface-variant font-medium">
              {city
                ? `Showing stores near ${city}`
                : "Discover verified sellers and local shops near you"}
            </p>
          </div>
        </div>
      </div>

      {/* Location Banner (if no location set) */}
      {!latitude && (
        <div className="mb-6 rounded-xl border border-tertiary/20 bg-gradient-to-r from-tertiary/5 to-secondary/5 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
                <Navigation className="h-4 w-4 text-tertiary" />
                Enable location for better results
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Share your location to see nearby stores, sorted by distance, with accurate delivery estimates.
              </p>
            </div>
            <button
              onClick={handleDetect}
              disabled={isDetecting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-60 shrink-0"
            >
              {isDetecting ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5" />
                  Detect Location
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline" />
          <input
            type="text"
            placeholder="Search stores by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-outline-variant/50 bg-surface-card pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none rounded-lg border border-outline-variant/50 bg-surface-card px-3 py-2.5 pr-8 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 cursor-pointer"
            >
              {latitude && <option value="distance">Sort by Distance</option>}
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-outline pointer-events-none" />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              showFilters
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-outline-variant/50 bg-surface-card text-on-surface hover:bg-surface-container"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>

          {/* List / Map toggle */}
          <div className="flex rounded-lg border border-outline-variant/50 overflow-hidden bg-surface-card">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === "map"
                  ? "bg-primary text-white"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              Map
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-outline-variant/30 bg-surface-card p-4 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-wrap gap-6">
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                Minimum Rating
              </label>
              <div className="flex gap-1.5">
                {[0, 3, 3.5, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      minRating === r
                        ? "bg-secondary text-white"
                        : "bg-surface-container text-on-surface-variant hover:bg-surface"
                    }`}
                  >
                    {r === 0 ? "All" : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>

            {latitude && (
              <div>
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-2">
                  Max Distance
                </label>
                <div className="flex gap-1.5">
                  {[10, 25, 50, 100, 5000].map((d) => (
                    <button
                      key={d}
                      onClick={() => setRadius(d)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        radius === d
                          ? "bg-secondary text-white"
                          : "bg-surface-container text-on-surface-variant hover:bg-surface"
                      }`}
                    >
                      {d >= 5000 ? "Any" : `${d} km`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count + View */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-on-surface-variant font-medium">
          {loading ? "Loading..." : `${stores.length} store${stores.length !== 1 ? "s" : ""} found`}
        </p>
        {viewMode === "map" && !loading && (
          <p className="text-[10px] text-on-surface-variant">
            {stores.filter(s => s.latitude && s.longitude).length} stores with GPS data
          </p>
        )}
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="mb-6 h-[480px] rounded-xl border border-outline-variant/20 overflow-hidden">
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

      {/* Store Cards Grid */}
      {viewMode === "list" && loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-outline-variant/20 bg-surface-card p-5 animate-pulse"
            >
              <div className="flex gap-3 mb-3">
                <div className="h-12 w-12 rounded-lg bg-surface-container" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-surface-container rounded mb-2" />
                  <div className="h-3 w-20 bg-surface-container rounded" />
                </div>
              </div>
              <div className="h-3 w-full bg-surface-container rounded mb-2" />
              <div className="h-3 w-3/4 bg-surface-container rounded" />
            </div>
          ))}
        </div>
      ) : viewMode === "list" && stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Store className="h-16 w-16 text-outline-variant mb-4" />
          <h3 className="text-lg font-bold text-primary mb-2">No stores found</h3>
          <p className="text-sm text-on-surface-variant max-w-sm">
            Try adjusting your filters, increasing the search radius, or searching with a different term.
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const openStatus = getOpenStatus(store.businessHours);
            return (
              <div
                key={store.id}
                className="group rounded-xl border border-outline-variant/20 bg-surface-card hover:shadow-observatory-lifted hover:border-secondary/20 transition-all duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Store Avatar */}
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {store.businessName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-primary truncate">
                          {store.businessName}
                        </h3>
                        {store.isVerified && (
                          <BadgeCheck className="h-4 w-4 text-secondary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 text-tertiary fill-tertiary" />
                          <span className="text-[11px] font-bold text-on-surface">
                            {store.rating.toFixed(1)}
                          </span>
                        </div>
                        {store.distanceKm !== null && (
                          <>
                            <span className="text-outline">·</span>
                            <span className="text-[11px] text-on-surface-variant font-medium">
                              {store.distanceKm < 1
                                ? `${Math.round(store.distanceKm * 1000)}m`
                                : `${store.distanceKm} km`}
                            </span>
                          </>
                        )}
                        <span className="text-outline">·</span>
                        <span
                          className={`text-[10px] font-bold ${
                            openStatus.isOpen ? "text-success" : "text-error"
                          }`}
                        >
                          {openStatus.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {store.description && (
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-3 line-clamp-2">
                      {store.description}
                    </p>
                  )}

                  {/* Info Rows */}
                  <div className="space-y-1.5">
                    {store.address && (
                      <div className="flex items-start gap-2 text-[11px] text-on-surface-variant">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-outline" />
                        <span className="line-clamp-1">
                          {store.address}
                          {store.city && `, ${store.city}`}
                          {store.pincode && ` - ${store.pincode}`}
                        </span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                        <Phone className="h-3 w-3 shrink-0 text-outline" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-outline-variant/15 bg-surface-container/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
                    <Package className="h-3 w-3" />
                    <span className="font-medium">{store.productCount} products</span>
                  </div>
                  <Link
                    href={`/products?sellerId=${store.id}`}
                    className="text-[11px] font-bold text-secondary hover:text-secondary/80 transition-colors flex items-center gap-0.5"
                  >
                    View Products
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
