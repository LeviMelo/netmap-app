// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure it scans correctly
  ],
  // Theme customizations moved to index.css @theme
  theme: {
    extend: {
      // Keep extend empty unless absolutely needed for things not possible in CSS @theme
      // (e.g., complex plugins might still need theme config here)
    },
  },
  plugins: [
     require('@tailwindcss/forms'), // Register plugins here
  ],
}