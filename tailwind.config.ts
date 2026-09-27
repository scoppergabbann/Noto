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
        // Accent orange — secondary emphasis only; primary actions use navy.
        amber: { DEFAULT: "#E59A39", deep: "#C77716", text: "#A45C0D", soft: "#FFF6E9" },
        // Semantic finance colors — tuned for AA contrast on both themes
        pos: { DEFAULT: "#0f9d6b", strong: "#0a7d54", soft: "#e6f6ef", dark: "#34d399" },
        neg: { DEFAULT: "#d83a3a", strong: "#b82c2c", soft: "#fdecec", dark: "#fb7185" },
        // Backward-compatible aliases for older pages (→ accessible values)
        brand: {
          green: "#0a7d54", // text-safe green on light (AA)
          red: "#b82c2c", // text-safe red on light (AA)
          indigo: "#275E9D",
        },
        // Text scale — light theme (all >= 4.5:1 on light surfaces)
        ink: {
          DEFAULT: "#18202B",
          body: "#343C47",
          muted: "#59616D",
          subtle: "#858C97",
          // backward-compatible aliases (older pages) → mapped to accessible values
          dim: "#59616D",
          faint: "#858C97",
        },
        // Surfaces
        surface: {
          base: "#F7F7F9",
          raised: "#FFFFFF",
          sunken: "#F0F1F3",
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
        glow: "0 8px 28px rgba(8,31,77,.18)",
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
