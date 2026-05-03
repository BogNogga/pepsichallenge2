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
        background: "#1F2941",
        surface: "#2A3554",
        accent: "#22D3EE",
        "accent-soft": "#7DDFF2",
        "accent-secondary": "#38BDF8",
        "accent-tertiary": "#0D9488",
        neutral: "#0F172A",
        "neutral-soft": "#1F2941",
        "text-primary": "#FAFAFA",
        "text-secondary": "#A1A1AA",
        "border-subtle": "#46527A",
      },
      borderRadius: {
        DEFAULT: "18px",
        sm: "10px",
        md: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "22px",
        "3xl": "24px",
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
          "0%": { boxShadow: "0 0 5px rgba(34,211,238,0.08), 0 0 10px rgba(34,211,238,0.04)" },
          "100%": { boxShadow: "0 0 10px rgba(34,211,238,0.16), 0 0 20px rgba(34,211,238,0.08)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
