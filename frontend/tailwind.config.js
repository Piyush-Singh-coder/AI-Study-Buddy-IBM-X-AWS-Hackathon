/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Neo-Brutalism Palette
        main: "#f0f0f0", // Light gray background
        "neo-white": "#ffffff",
        "neo-black": "#000000",
        "neo-purple": "#8B5CF6",
        "neo-pink": "#F472B6",
        "neo-yellow": "#FBBF24",
        "neo-blue": "#3B82F6",
        "neo-green": "#10B981",
        "neo-red": "#EF4444",
        // Legacy mappings
        primary: "#8B5CF6",
        secondary: "#10B981",
        dark: "#1F2937",
      },
      boxShadow: {
        neo: "4px 4px 0px 0px #000000",
        "neo-sm": "2px 2px 0px 0px #000000",
        "neo-lg": "8px 8px 0px 0px #000000",
        "neo-xl": "12px 12px 0px 0px #000000",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderWidth: {
        DEFAULT: "2px",
        0: "0",
        2: "2px",
        3: "3px",
        4: "4px",
      },
    },
  },
  plugins: [],
};
