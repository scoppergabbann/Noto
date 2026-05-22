import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        // Brand accent (warm amber) — used sparingly for primary actions
        amber: { DEFAULT: "#f59425", deep: "#e07a0c", text: "#9a5409", soft: "#fff4e6" },
        // Semantic finance colors — tuned for AA contrast on both themes
        pos: { DEFAULT: "#0f9d6b", strong: "#0a7d54", soft: "#e6f6ef", dark: "#34d399" },
        neg: { DEFAULT: "#d83a3a", strong: "#b82c2c", soft: "#fdecec", dark: "#fb7185" },
        // Backward-compatible aliases for older pages (→ accessible values)
        brand: {
          green: "#0a7d54", // text-safe green on light (AA)
          red: "#b82c2c", // text-safe red on light (AA)
          indigo: "#4f46e5", // text-safe indigo on light (AA)
        },
        // Text scale — light theme (all >= 4.5:1 on light surfaces)
        ink: {
          DEFAULT: "#15181e", // headings — ~15:1
          body: "#2c313a", // body — ~10:1
          muted: "#525a67", // secondary — ~6.4:1 (AA)
          subtle: "#646b78", // tertiary/labels — ~5:1 (AA)
          // backward-compatible aliases (older pages) → mapped to accessible values
          dim: "#525a67",
          faint: "#646b78",
        },
        // Surfaces
        surface: {
          base: "#f3f4f7",
          raised: "#ffffff",
          sunken: "#eceef2",
        },
        // Dark theme surfaces & ink (referenced via dark: utilities)
        night: {
          base: "#0a0c11",
          raised: "#15181f",
          raised2: "#1b1f28",
          border: "#272c37",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,18,24,.04), 0 8px 24px rgba(16,18,24,.05)",
        softlg: "0 2px 8px rgba(16,18,24,.06), 0 20px 48px rgba(16,18,24,.10)",
        glow: "0 8px 28px rgba(245,148,37,.28)",
      },
      borderRadius: {
        xl2: "20px",
        xl3: "26px",
      },
    },
  },
  plugins: [],
};
export default config;
