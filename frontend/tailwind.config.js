/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Slotify Approved Foundation Palette
        "warm-ivory": "#F7F6F2",
        "charcoal": "#202321",
        "slate-gray": "#626A70",
        "muted-cobalt": {
          DEFAULT: "#3559C7",
          hover: "#2B49A8",
          active: "#233D8D",
          light: "#E9EEFC",
        },
        "pale-blue": {
          DEFAULT: "#E9EEFC",
          border: "#C8D7F9",
        },
        "soft-border": "#E4E3DD",
        "success-green": {
          DEFAULT: "#26734D",
          subtle: "#EAF4EE",
          border: "#B2DEC4",
        },
        "warning-amber": {
          DEFAULT: "#996515",
          subtle: "#FDF6E7",
          border: "#F1DCAC",
        },
        "error-red": {
          DEFAULT: "#B93838",
          subtle: "#FDF0F0",
          border: "#F5C2C2",
        },

        // Semantic tokens mapped to CSS variables
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          foreground: "var(--surface-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        status: {
          confirmed: "var(--success)",
          "confirmed-bg": "var(--success-subtle)",
          pending: "var(--warning)",
          "pending-bg": "var(--warning-subtle)",
          conflict: "var(--destructive)",
          "conflict-bg": "var(--destructive-subtle)",
          cancelled: "var(--muted-foreground)",
          "cancelled-bg": "var(--muted)",
        },
      },
      fontFamily: {
        heading: [
          "'Plus Jakarta Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
        body: [
          "'DM Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "'Helvetica Neue'",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.75rem",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(32, 35, 33, 0.04)",
        card: "0 1px 3px 0 rgba(32, 35, 33, 0.06), 0 1px 2px -1px rgba(32, 35, 33, 0.04)",
        elevated: "0 4px 6px -1px rgba(32, 35, 33, 0.06), 0 2px 4px -2px rgba(32, 35, 33, 0.04)",
      },
    },
  },
  plugins: [],
}
