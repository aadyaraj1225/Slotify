/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Slotify Retro-Digital Palette
        "deep-black": "#101010",
        "near-black": "#191919",
        "hot-pink": {
          DEFAULT: "#F542A6",
          hover: "#E43496",
          light: "#FDF0F7",
        },
        "electric-lime": {
          DEFAULT: "#D7FF35",
          hover: "#C9F228",
          light: "#FAFEE6",
        },
        "sky-blue": {
          DEFAULT: "#73D0F4",
          hover: "#5BC4EE",
          light: "#EBF8FD",
        },
        "warm-offwhite": "#F7F5EE",
        "muted-gray": "#B8B8B8",
        "success-green": {
          DEFAULT: "#70D6A0",
          subtle: "#EBF9F1",
        },
        "warning-amber": {
          DEFAULT: "#FFC857",
          subtle: "#FFF9EB",
        },
        "error-red": {
          DEFAULT: "#FF6262",
          subtle: "#FFF0F0",
        },

        // Legacy Aliases for seamless component integration
        "warm-ivory": "#F7F5EE",
        "charcoal": "#101010",
        "slate-gray": "#626A70",
        "muted-cobalt": {
          DEFAULT: "#101010",
          hover: "#191919",
          active: "#000000",
          light: "#EBF8FD",
        },
        "pale-blue": {
          DEFAULT: "#EBF8FD",
          border: "#73D0F4",
        },
        "soft-border": "#E4E3DD",

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
      },
      fontFamily: {
        heading: [
          "'Plus Jakarta Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        body: [
          "'DM Sans'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "'Segoe UI'",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.625rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(16, 16, 16, 0.04)",
        card: "0 1px 3px 0 rgba(16, 16, 16, 0.06)",
        retro: "2px 2px 0px #101010",
        "retro-lg": "4px 4px 0px #101010",
        "retro-pink": "3px 3px 0px #F542A6",
        "retro-lime": "3px 3px 0px #D7FF35",
      },
    },
  },
  plugins: [],
}
