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
        "background": "#0a0a0f",
        "surface": "#0a0a0f",
        "surface-dim": "#0a0a0f",
        "surface-bright": "#1d1d24",
        "surface-container-lowest": "#0a0a0f",
        "surface-container-low": "#121218",
        "surface-container": "#17171d",
        "surface-container-high": "#1d1d24",
        "surface-container-highest": "#262630",
        "surface-variant": "#1d1d24",
        "on-surface": "#e8e8f0",
        "on-surface-variant": "#9a9aab",
        "on-background": "#e8e8f0",
        "outline": "#454555",
        "outline-variant": "#23232c",
        "primary": "#6366f1",
        "on-primary": "#ffffff",
        "primary-container": "#1d1d3d",
        "on-primary-container": "#818cf8",
        "secondary": "#8b5cf6",
        "on-secondary": "#ffffff",
        "secondary-container": "#24183d",
        "on-secondary-container": "#a78bfa",
        "tertiary": "#ec4899",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#3d182b",
        "on-tertiary-container": "#f472b6",
        "error": "#ef4444",
        "on-error": "#ffffff",
        "error-container": "#3d1818",
        "on-error-container": "#f87171"
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
