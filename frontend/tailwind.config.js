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
              "on-tertiary-fixed": "#301400",
              "surface-container-high": "#292932",
              "on-error-container": "#ffdad6",
              "tertiary-fixed-dim": "#ffb783",
              "surface-variant": "#34343d",
              "on-secondary": "#002e6a",
              "on-surface": "#e4e1ed",
              "surface-dim": "#13131b",
              "primary-fixed-dim": "#c0c1ff",
              "on-primary-fixed": "#07006c",
              "background": "#13131b",
              "outline": "#908fa0",
              "on-secondary-fixed": "#001a42",
              "on-surface-variant": "#c7c4d7",
              "primary-container": "#8083ff",
              "tertiary": "#ffb783",
              "surface-bright": "#393841",
              "secondary-fixed-dim": "#adc6ff",
              "surface-tint": "#c0c1ff",
              "on-error": "#690005",
              "error": "#ffb4ab",
              "outline-variant": "#464554",
              "inverse-primary": "#494bd6",
              "on-secondary-fixed-variant": "#004395",
              "secondary": "#adc6ff",
              "surface-container-highest": "#34343d",
              "on-primary-fixed-variant": "#2f2ebe",
              "on-primary-container": "#0d0096",
              "on-tertiary-container": "#452000",
              "primary-fixed": "#e1e0ff",
              "secondary-fixed": "#d8e2ff",
              "primary": "#c0c1ff",
              "on-tertiary-fixed-variant": "#703700",
              "on-secondary-container": "#e6ecff",
              "surface-container-lowest": "#0d0d15",
              "on-background": "#e4e1ed",
              "secondary-container": "#0566d9",
              "error-container": "#93000a",
              "tertiary-fixed": "#ffdcc5",
              "surface": "#13131b",
              "surface-container-low": "#1b1b23",
              "tertiary-container": "#d97721",
              "on-tertiary": "#4f2500",
              "on-primary": "#1000a9",
              "surface-container": "#1f1f27",
              "inverse-on-surface": "#303038",
              "inverse-surface": "#e4e1ed"
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
              "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
              "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
              "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
              "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}],
              "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
              "code-md": ["14px", {"lineHeight": "22px", "fontWeight": "400"}]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  require('@tailwindcss/container-queries')
  ],
}
