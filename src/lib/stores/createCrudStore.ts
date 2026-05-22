import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CrudState<T extends { id: string }> {
  items: T[];
  add: (item: Omit<T, "id">) => void;
  update: (id: string, patch: Partial<Omit<T, "id">>) => void;
  remove: (id: string) => void;
  reset: () => void;
  replaceAll: (items: T[]) => void;
}

/** ID sederhana & unik untuk data lokal. */
export function genId(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Membuat store CRUD ber-persist (localStorage) yang di-seed dengan data awal.
 * Dipakai untuk tiap domain: goals, debts, dst.
 */
export function createCrudStore<T extends { id: string }>(
  name: string,
  seed: T[],
  idPrefix: string
) {
  return create<CrudState<T>>()(
    persist(
      (set) => ({
        items: seed,
        add: (item) => set((s) => ({ items: [...s.items, { ...item, id: genId(idPrefix) } as T] })),
        update: (id, patch) =>
          set((s) => ({
            items: s.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
          })),
        remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
        reset: () => set({ items: seed }),
        replaceAll: (items) => set({ items }),
      }),
      {
        name: `noto-${name}`,
        storage: createJSONStorage(() => localStorage),
        version: 1,
        skipHydration: true,
      }
    )
  );
}
