/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C2410C",
        secondary: "#EA580C",
        accent: "#FB923C",
        background: "#FFFBF7",
        surface: "#FFFFFF",
        ink: "#1C1917",
        muted: "#78716C",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(17, 24, 39, 0.08), 0 2px 8px -2px rgba(17, 24, 39, 0.04)",
        "soft-lg": "0 12px 40px -8px rgba(17, 24, 39, 0.12), 0 4px 16px -4px rgba(17, 24, 39, 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
