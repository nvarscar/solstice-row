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
        navy: {
          900: "#0a1628",
          800: "#0f2240",
          700: "#14305a",
          600: "#1a3f74",
        },
        solstice: {
          gold: "#f59e0b",
          amber: "#d97706",
          dawn: "#fbbf24",
          glow: "#fde68a",
        },
        water: {
          deep: "#0c4a6e",
          mid: "#0369a1",
          light: "#38bdf8",
          foam: "#e0f2fe",
        },
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(to bottom, #0a1628 0%, #0f2240 40%, #1a3f74 70%, #0c4a6e 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.8s ease-out forwards",
        shimmer: "shimmer 2s infinite",
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
