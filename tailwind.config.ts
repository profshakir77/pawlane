import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Clean premium palette. Token names kept so admin pages keep working.
        ink: "#1F1D1A",      // warm charcoal text
        moss: "#4A5D4F",     // deep sage accent
        meadow: "#F2EEE7",   // soft sand surface
        biscuit: "#B98E57",  // muted brass highlight
        paper: "#FBF9F5",    // ivory background
        line: "#E6E0D6",     // hairline borders
        clay: "#9A4B36",     // sale / urgency
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        caps: "0.14em",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(31,29,26,.04), 0 8px 24px -12px rgba(31,29,26,.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
