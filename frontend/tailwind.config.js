/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all relevant files in src
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Define our custom color palette
        // Using CSS variables for potential runtime theme switching ease
        // We define them here for Tailwind autocompletion and utility generation
        'primary-dark': 'var(--color-primary-dark)',   // Example: Deep purple/blue
        'secondary-dark': 'var(--color-secondary-dark)', // Example: Darker background
        'accent-cyan': 'var(--color-accent-cyan)',    // Example: Cyan
        'accent-gold': 'var(--color-accent-gold)',    // Example: Gold
        'text-primary-dark': 'var(--color-text-primary-dark)', // Example: Light gray/white
        'text-secondary-dark': 'var(--color-text-secondary-dark)', // Example: Muted gray
        'border-dark': 'var(--color-border-dark)',      // Example: Dark gray border

        // Corresponding light mode colors (can be defined later or now)
        'primary-light': 'var(--color-primary-light)',
        'secondary-light': 'var(--color-secondary-light)',
        'text-primary-light': 'var(--color-text-primary-light)',
        'text-secondary-light': 'var(--color-text-secondary-light)',
        'border-light': 'var(--color-border-light)',
      }
    },
  },
  plugins: [],
}