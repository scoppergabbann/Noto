"use client";

import { create } from "zustand";
import type { Repo } from "@/lib/db/repository";

export type SupabaseStoreState<T extends { id: string }> = {
  items: T[];
  loading: boolean;
  error: string | null;
  // actions
  fetch: () => Promise<void>;
  add: (draft: Omit<T, "id">) => Promise<void>;
  update: (id: string, patch: Partial<Omit<T, "id">>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  // kept for backup compat
  reset: () => void;
  replaceAll: (items: T[]) => void;
};

export function createSupabaseStore<T extends { id: string }>(repo: Repo<T>, storeName: string) {
  return create<SupabaseStoreState<T>>()((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetch: async () => {
      set({ loading: true, error: null });
      try {
        const items = await repo.getAll();
        set({ items, loading: false });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Gagal memuat data";
        console.error(`[${storeName}]`, msg);
        set({ loading: false, error: msg });
      }
    },

    add: async (draft) => {
      // optimistic: add temp item immediately
      const tempId = `_tmp_${Date.now()}`;
      const tempItem = { ...draft, id: tempId } as T;
      set((s) => ({ items: [...s.items, tempItem] }));
      try {
        const created = await repo.create(draft as Record<string, unknown>);
        // replace temp with real
        set((s) => ({ items: s.items.map((i) => (i.id === tempId ? created : i)) }));
      } catch (e) {
        // rollback
        set((s) => ({ items: s.items.filter((i) => i.id !== tempId), error: String(e) }));
      }
    },

    update: async (id, patch) => {
      const prev = get().items.find((i) => i.id === id);
      // optimistic update
      set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
      try {
        const full = { ...prev, ...patch } as Omit<T, "id">;
        const updated = await repo.update(id, full as Record<string, unknown>);
        set((s) => ({ items: s.items.map((i) => (i.id === id ? updated : i)) }));
      } catch (e) {
        // rollback
        if (prev)
          set((s) => ({ items: s.items.map((i) => (i.id === id ? prev : i)), error: String(e) }));
      }
    },

    remove: async (id) => {
      const prev = get().items;
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
      try {
        await repo.remove(id);
      } catch (e) {
        set({ items: prev, error: String(e) });
      }
    },

    reset: () => set({ items: [], error: null }),
    replaceAll: (items) => set({ items }),
  }));
}
