import { create } from "zustand";

interface CompareState {
  productIds: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  productIds: [],
  add: (id: string) => {
    const { productIds } = get();
    if (productIds.includes(id)) return;
    if (productIds.length >= 4) {
      // Remove first item and append new one if limit is reached
      set({ productIds: [...productIds.slice(1), id] });
    } else {
      set({ productIds: [...productIds, id] });
    }
  },
  remove: (id: string) => {
    set({ productIds: get().productIds.filter((pId) => pId !== id) });
  },
  clear: () => {
    set({ productIds: [] });
  },
  isSelected: (id: string) => {
    return get().productIds.includes(id);
  },
}));
