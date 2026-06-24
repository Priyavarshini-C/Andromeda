// =============================================================================
// Andromeda — User Location Store (Zustand + localStorage persistence)
// =============================================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  pincode: string | null;
  isDetecting: boolean;
  hasPermission: boolean | null;

  setLocation: (data: {
    latitude: number;
    longitude: number;
    city?: string;
    pincode?: string;
  }) => void;
  setPincode: (pincode: string) => void;
  setCity: (city: string) => void;
  detectLocation: () => Promise<void>;
  clearLocation: () => void;
}

// Major Indian city pincode → approximate coordinates for manual pincode input
const PINCODE_MAP: Record<string, { lat: number; lng: number; city: string }> = {
  "560001": { lat: 12.9716, lng: 77.5946, city: "Bengaluru" },
  "600017": { lat: 13.0827, lng: 80.2707, city: "Chennai" },
  "411005": { lat: 18.5204, lng: 73.8567, city: "Pune" },
  "400050": { lat: 19.0596, lng: 72.8295, city: "Mumbai" },
  "700016": { lat: 22.5726, lng: 88.3639, city: "Kolkata" },
  "110001": { lat: 28.6139, lng: 77.2090, city: "New Delhi" },
  "500001": { lat: 17.3850, lng: 78.4867, city: "Hyderabad" },
  "380009": { lat: 23.0225, lng: 72.5714, city: "Ahmedabad" },
  "302001": { lat: 26.9124, lng: 75.7873, city: "Jaipur" },
  // Generic fallback ranges
  "400001": { lat: 18.9388, lng: 72.8354, city: "Mumbai" },
  "110002": { lat: 28.6328, lng: 77.2197, city: "New Delhi" },
  "560002": { lat: 12.9783, lng: 77.5908, city: "Bengaluru" },
};

// Reverse geocode coordinates to the nearest seeded city
function reverseGeocode(lat: number, lng: number): { city: string; pincode: string } {
  const cities = [
    { city: "Bengaluru", lat: 12.9716, lng: 77.5946, pincode: "560001" },
    { city: "Chennai", lat: 13.0827, lng: 80.2707, pincode: "600017" },
    { city: "Pune", lat: 18.5204, lng: 73.8567, pincode: "411005" },
    { city: "Mumbai", lat: 19.0596, lng: 72.8295, pincode: "400050" },
    { city: "Kolkata", lat: 22.5726, lng: 88.3639, pincode: "700016" },
    { city: "New Delhi", lat: 28.6139, lng: 77.2090, pincode: "110001" },
    { city: "Hyderabad", lat: 17.3850, lng: 78.4867, pincode: "500001" },
    { city: "Ahmedabad", lat: 23.0225, lng: 72.5714, pincode: "380009" },
    { city: "Jaipur", lat: 26.9124, lng: 75.7873, pincode: "302001" },
  ];

  let nearest = cities[0];
  let minDist = Infinity;

  for (const c of cities) {
    const d = Math.sqrt((c.lat - lat) ** 2 + (c.lng - lng) ** 2);
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  }

  return { city: nearest.city, pincode: nearest.pincode };
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      city: null,
      pincode: null,
      isDetecting: false,
      hasPermission: null,

      setLocation: (data) =>
        set({
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || null,
          pincode: data.pincode || null,
        }),

      setPincode: (pincode) => {
        const match = PINCODE_MAP[pincode];
        if (match) {
          set({
            pincode,
            latitude: match.lat,
            longitude: match.lng,
            city: match.city,
          });
        } else {
          // Store pincode even if we don't have coords
          set({ pincode, city: null });
        }
      },

      setCity: (city) => set({ city }),

      detectLocation: async () => {
        if (!navigator.geolocation) {
          set({ hasPermission: false, isDetecting: false });
          return;
        }

        set({ isDetecting: true });

        return new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const geo = reverseGeocode(latitude, longitude);
              set({
                latitude,
                longitude,
                city: geo.city,
                pincode: geo.pincode,
                isDetecting: false,
                hasPermission: true,
              });
              resolve();
            },
            () => {
              set({ isDetecting: false, hasPermission: false });
              resolve();
            },
            { enableHighAccuracy: false, timeout: 10000 }
          );
        });
      },

      clearLocation: () =>
        set({
          latitude: null,
          longitude: null,
          city: null,
          pincode: null,
          hasPermission: null,
        }),
    }),
    {
      name: "andromeda-location",
      partialize: (state) => ({
        latitude: state.latitude,
        longitude: state.longitude,
        city: state.city,
        pincode: state.pincode,
      }),
    }
  )
);
