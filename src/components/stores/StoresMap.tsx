// =============================================================================
// Andromeda — OpenStreetMap Stores Map Component (Leaflet)
// =============================================================================

"use client";

import React, { useEffect, useRef, useState } from "react";

interface StoreMarker {
  id: string;
  businessName: string;
  latitude: number;
  longitude: number;
  rating: number;
  isVerified: boolean;
  address: string | null;
  city: string | null;
  slug: string;
}

interface StoresMapProps {
  stores: StoreMarker[];
  userLat?: number | null;
  userLng?: number | null;
  onStoreClick?: (storeId: string) => void;
}

export default function StoresMap({ stores, userLat, userLng, onStoreClick }: StoresMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet (avoids SSR issues)
    import("leaflet").then((L) => {
      // Fix default icon paths for Next.js
      (L.Icon.Default as any).mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Determine center: user location > stores centroid > default (India)
      let center: [number, number] = [20.5937, 78.9629];
      let zoom = 5;

      if (userLat && userLng) {
        center = [userLat, userLng];
        zoom = 13;
      } else if (stores.length > 0) {
        const avgLat = stores.reduce((s, st) => s + st.latitude, 0) / stores.length;
        const avgLng = stores.reduce((s, st) => s + st.longitude, 0) / stores.length;
        center = [avgLat, avgLng];
        zoom = stores.length === 1 ? 14 : 11;
      }

      // Initialize map
      const map = L.map(mapRef.current!, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: true,
      });

      // Add OpenStreetMap tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // User location marker (blue dot)
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="
            width:16px;height:16px;
            background:#6750A4;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 0 3px rgba(103,80,164,0.3);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        L.marker([userLat, userLng], { icon: userIcon })
          .bindPopup("<b>📍 Your Location</b>")
          .addTo(map);
      }

      // Store markers
      stores.forEach((store) => {
        const storeIcon = L.divIcon({
          className: "",
          html: `<div style="
            display:flex;align-items:center;justify-content:center;
            width:32px;height:32px;
            background:${store.isVerified ? "#6750A4" : "#625B71"};
            border:2px solid white;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            cursor:pointer;
          ">
            <div style="transform:rotate(45deg);font-size:14px;">🏪</div>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const popup = L.popup({
          maxWidth: 240,
          className: "andromeda-popup",
        }).setContent(`
          <div style="font-family:system-ui,sans-serif;min-width:180px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${store.businessName}</div>
            ${store.isVerified ? '<span style="font-size:10px;background:#D0BCFF;color:#21005D;padding:2px 6px;border-radius:20px;font-weight:600;">✓ Verified</span>' : ""}
            <div style="font-size:12px;margin-top:6px;color:#49454F;">
              ${store.address ? `📍 ${store.address}${store.city ? `, ${store.city}` : ""}` : ""}
            </div>
            <div style="font-size:12px;color:#49454F;margin-top:2px;">⭐ ${store.rating.toFixed(1)}</div>
            <a href="/products?sellerId=${store.id}" style="
              display:inline-block;margin-top:8px;
              background:#6750A4;color:white;
              padding:5px 10px;border-radius:6px;
              font-size:11px;font-weight:600;
              text-decoration:none;
            ">View Products →</a>
          </div>
        `);

        const marker = L.marker([store.latitude, store.longitude], { icon: storeIcon })
          .bindPopup(popup)
          .addTo(map);

        marker.on("click", () => {
          if (onStoreClick) onStoreClick(store.id);
        });
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when user location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !userLat || !userLng) return;
    mapInstanceRef.current.setView([userLat, userLng], 13, { animate: true });
  }, [userLat, userLng]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-card">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-on-surface-variant font-medium">Loading map…</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
    </div>
  );
}
