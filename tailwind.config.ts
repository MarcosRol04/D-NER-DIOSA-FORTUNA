import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        "primary-dark": "var(--primary-dark)",
        background: "var(--background-color)",
        surface: "var(--surface-color)",
        ink: "var(--text-color)",
        "ink-soft": "var(--text-soft-color)",
        border: "var(--border-color)",
        success: "var(--success-color)",
        danger: "var(--danger-color)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        card: "18px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(20, 18, 16, 0.06)",
        float: "0 8px 24px rgba(20, 18, 16, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
