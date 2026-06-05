import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: "#071407",
          900: "#0d2b0d",
          800: "#1a4a1a",
          700: "#225522",
          600: "#2d7a2d",
          500: "#3a9e3a",
          400: "#5cc45c",
          300: "#86d986",
          200: "#b8eab8",
          100: "#e3f7e3",
        },
        solstice: {
          gold: "#e8b800",
          "gold-light": "#f5c518",
          "gold-dark": "#c49a00",
          "gold-glow": "#fff176",
          orange: "#e85d04",
          amber: "#f59e0b",
        },
        water: {
          deep: "#0c3d2a",
          mid: "#155e3d",
          light: "#4ade80",
          foam: "#dcfce7",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(to bottom, #071407 0%, #0d2b0d 35%, #1a4a1a 70%, #0d2b0d 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #e8b800 0%, #f5c518 50%, #c49a00 100%)",
        "sunrise-gradient":
          "linear-gradient(to right, #e85d04, #e8b800, #f5c518)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        shimmer: "shimmer 2s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
