import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      "colors": {
        "background": "#000000",
        "surface": "#0a0a0a",
        "surface-dim": "#111111",
        "surface-bright": "#1a1a1a",
        "surface-container-lowest": "#000000",
        "surface-container-low": "#0a0a0a",
        "surface-container": "#111111",
        "surface-container-high": "#1a1a1a",
        "surface-container-highest": "#222222",
        "surface-variant": "#1f1f22",
        "on-surface": "#fafafa",
        "on-surface-variant": "#a1a1aa",
        "on-background": "#ffffff",
        "outline": "#333333",
        "outline-variant": "#222222",
        "primary": "#0070f3", // Vercel Blue
        "on-primary": "#ffffff",
        "primary-container": "#00326b",
        "on-primary-container": "#99c7ff",
        "secondary": "#7928ca", // Vibrant Purple
        "on-secondary": "#ffffff",
        "secondary-container": "#36115c",
        "on-secondary-container": "#d6a8ff",
        "tertiary": "#ff0080", // Vibrant Pink
        "on-tertiary": "#ffffff",
        "tertiary-container": "#660033",
        "on-tertiary-container": "#ff99cc",
        "error": "#ef4444",
        "on-error": "#ffffff",
        "error-container": "#451212",
        "on-error-container": "#fca5a5",
        "neon-cyan": "#00f0ff",
        "neon-purple": "#b200ff"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "sm": "8px",
        "sidebar-width": "260px",
        "lg": "24px",
        "md": "16px",
        "xl": "40px",
        "gutter": "16px",
        "unit": "4px",
        "xs": "4px"
      },
      "fontFamily": {
        "body-lg": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "label-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "code-md": ["JetBrains Mono", "monospace"]
      },
      "fontSize": {
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-md": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "code-md": ["14px", { "lineHeight": "22px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    forms,
    containerQueries
  ],
}
