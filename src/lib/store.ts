import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

interface PrivacyState {
  hideMoney: boolean;
  pin: string | null;
  visibleUntil: number | null;
  lockMoney: () => void;
  setPin: (pin: string) => void;
  resetPin: () => void;
  unlockFor: (minutes: number) => void;
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
      hideMoney: true,
      pin: null,
      visibleUntil: null,
      lockMoney: () => set({ hideMoney: true, visibleUntil: null }),
      setPin: (pin) => set({ pin }),
      resetPin: () => set({ pin: null, hideMoney: true, visibleUntil: null }),
      unlockFor: (minutes) =>
        set({
          hideMoney: false,
          visibleUntil: Date.now() + minutes * 60 * 1000,
        }),
      setHideMoney: (v) => set({ hideMoney: v }),
    }),
    { name: "noto-privacy" }
  )
);
