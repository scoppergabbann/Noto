import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      colors: {
        amber: { DEFAULT: "#ff9d2e", deep: "#f07d10" },
        ink: { DEFAULT: "#16161a", dim: "#5b5f6b", faint: "#9a9ea9" },
        brand: { green: "#1f9e6f", red: "#e0524a", indigo: "#6b6ff0" },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,16,24,.04), 0 12px 32px rgba(16,16,24,.06)",
        softlg: "0 2px 6px rgba(16,16,24,.05), 0 24px 60px rgba(16,16,24,.10)",
      },
    },
  },
  plugins: [],
};
export default config;
