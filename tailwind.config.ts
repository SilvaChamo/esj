import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#122A55",
          50: "#EEF2F9",
          100: "#D7E0EF",
          800: "#16305C",
          900: "#0C1D3B",
        },
        sky: {
          DEFAULT: "#159BDB",
          300: "#7DCBF2",
          600: "#1290D1",
          700: "#0E75AA",
        },
        leaf: {
          DEFAULT: "#2E9E4F",
        },
        crimson: {
          DEFAULT: "#D42A3A",
        },
        cream: "#F7F7F5",
        mark: "#A4CAE8",
      },
      fontFamily: {
        serif: ["var(--font-libre-baskerville)", "Georgia", "serif"],
        sans: ["var(--font-libre-baskerville)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
