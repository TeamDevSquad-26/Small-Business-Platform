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
        primary: "#4F46E5",
        secondary: "#22C55E",
        accent: "#F59E0B",
        background: "#F9FAFB",
        surface: "#FFFFFF",
        ink: "#111827",
        muted: "#6B7280",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(17, 24, 39, 0.08), 0 2px 8px -2px rgba(17, 24, 39, 0.04)",
        "soft-lg": "0 12px 40px -8px rgba(17, 24, 39, 0.12), 0 4px 16px -4px rgba(17, 24, 39, 0.06)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: [
          "var(--font-heading)",
          "Georgia",
          "Times New Roman",
          "serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
