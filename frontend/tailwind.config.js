/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark/light mode switching via HTML class
  theme: {
    extend: {
      // Map color names used in classes (e.g., bg-bg-primary) to CSS variables
      colors: {
        // Backgrounds
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',

        // Accents
        'accent-primary': 'var(--color-accent-primary)',
        'accent-primary-hover': 'var(--color-accent-primary-hover)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'accent-secondary-hover': 'var(--color-accent-secondary-hover)',
        'accent-tertiary': 'var(--color-accent-tertiary)',

        // Text
        'text-base': 'var(--color-text-base)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverted': 'var(--color-text-inverted)',
        'text-accent': 'var(--color-text-accent)',

        // Borders
        'border': 'var(--color-border)', // Simplified name

        // Status (using default Tailwind names mapped to variables)
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
      },
      // Extend other theme aspects if needed (fontFamily, spacing, etc.)
      fontFamily: {
         sans: ['Inter', 'system-ui', 'sans-serif'], // Add Inter font
      },
    },
  },
  plugins: [],
}