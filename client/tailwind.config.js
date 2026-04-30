/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1f2937",
        muted: "#64748b",
        line: "#d6dee8",
        brand: "#2563eb",
        accent: "#0f766e"
      },
      boxShadow: {
        soft: "0 16px 48px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};
