/** @type {import('tailwindcss').Config} */
//
// Tokens follow the Klook-patterned system recorded in
// claude/tripojo-design-system.md: one vivid orange for calls to action, a
// separate amber reserved for rating stars so social proof never competes
// with a CTA, and teal kept from the original brand for trust marks.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "system-ui", "-apple-system", "sans-serif"],
        display: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#FFF1EA",
          100: "#FFDFCE",
          200: "#FFC1A0",
          300: "#FF9B69",
          400: "#FF7A3D",
          500: "#FF5B00", // the only CTA colour
          600: "#E04F00",
          700: "#B33F00",
        },
        ink: {
          900: "#1A1A1A",
          700: "#3D3D3D",
          500: "#5A5A5A",
          400: "#8C8C8C",
          300: "#B5B5B5",
          200: "#E4E4E6",
          100: "#F1F1F3",
        },
        band: "#F6F6F8",
        surface: "#FFFFFF",
        star: "#FF9500",
        trust: {
          500: "#0F766E",
          50: "#E4F1EF",
        },
        ok: { 500: "#0E8F63", 50: "#E6F5EF" },
        alert: { 500: "#E0372B", 50: "#FDECEA" },
        warn: { 500: "#A15C00", 50: "#FAEDD4" },

        // Compatibility aliases for the screens not yet migrated to the new
        // names (onboarding wizards, dashboards, landing). They point at the
        // new palette, so those screens pick up the Klook orange for free
        // instead of silently losing their styling. Delete once every screen
        // uses brand/band directly.
        primary: {
          50: "#FFF1EA",
          100: "#FFDFCE",
          200: "#FFC1A0",
          300: "#FF9B69",
          400: "#FF7A3D",
          500: "#FF5B00",
          600: "#E04F00",
          700: "#B33F00",
        },
        teal: { 50: "#E4F1EF", 100: "#CFE4E1", 300: "#7FB3AC", 500: "#0F766E", 700: "#0B534D" },
        bg: "#FFFFFF",
        success: "#0E8F63",
        danger: "#E0372B",
        warning: "#A15C00",
      },
      borderRadius: {
        card: "10px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(20,20,28,.08), 0 4px 14px rgba(20,20,28,.06)",
        bar: "0 -4px 14px rgba(20,20,28,.08)",
      },
      fontSize: {
        meta: ["11px", { lineHeight: "1.45" }],
        chip: ["10.5px", { lineHeight: "1.4" }],
      },
    },
  },
  plugins: [],
};
