import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        surface: "#141414",
        accent: "#06B6D4",
        "text-primary": "#FAFAFA",
        "text-secondary": "#A1A1AA",
        "border-subtle": "#262626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6,182,212,0.2), 0 0 10px rgba(6,182,212,0.1)" },
          "100%": { boxShadow: "0 0 10px rgba(6,182,212,0.4), 0 0 20px rgba(6,182,212,0.2)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
