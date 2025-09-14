import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#6C5CE7",
        teal: "#00D2D3",
        good: "#22C55E",
        warn: "#F59E0B",
        bad: "#EF4444",
        ink: "#0f172a",
      },
      boxShadow: {
        card: "0 10px 30px rgba(17, 24, 39, .08)",
      },
      borderRadius: {
        xl: "16px",
      },
      fontFamily: {
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
