import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

interface PrivacyState {
  hideMoney: boolean;
  toggleMoney: () => void;
  setHideMoney: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggle: () => set((s) => ({ isDark: !s.isDark })),
      setDark: (v) => set({ isDark: v }),
    }),
    { name: "noto-theme" }
  )
);

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set) => ({
      hideMoney: false,
      toggleMoney: () => set((s) => ({ hideMoney: !s.hideMoney })),
      setHideMoney: (v) => set({ hideMoney: v }),
    }),
    { name: "noto-privacy" }
  )
);
