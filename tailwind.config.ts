import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F4EF",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#15171C",
          muted: "#565C6B",
          faint: "#8A90A0",
        },
        line: "#E7E4DC",
        brand: {
          50: "#EEEBFE",
          100: "#DDD6FD",
          200: "#BCADFB",
          500: "#5A3FF0",
          600: "#4A2FD6",
          700: "#3C25AE",
          ink: "#1E1545",
        },
        accent: {
          DEFAULT: "#FF6B4A",
          soft: "#FFE7E0",
        },
        teal: {
          DEFAULT: "#0F9E8E",
          soft: "#DBF3EF",
        },
        amber: {
          DEFAULT: "#E8A23D",
          soft: "#FBEED8",
        },
        // Focused "workplace" dark surfaces
        work: {
          bg: "#0D0F15",
          panel: "#161A24",
          panel2: "#1E2330",
          line: "#2A3040",
          text: "#E8EAF0",
          muted: "#9BA2B4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,28,0.04), 0 8px 24px -12px rgba(20,22,28,0.12)",
        lift: "0 2px 4px rgba(20,22,28,0.05), 0 18px 48px -18px rgba(30,21,69,0.28)",
        glow: "0 0 0 1px rgba(90,63,240,0.2), 0 12px 40px -12px rgba(90,63,240,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.4s ease both",
        "pulse-dot": "pulse-dot 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
