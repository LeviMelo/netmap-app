// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Using SWC for speed
import tailwindcss from '@tailwindcss/vite'; // Import the Tailwind Vite plugin
import tsconfigPaths from 'vite-tsconfig-paths'; // Import tsconfig-paths plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the Tailwind plugin
    tsconfigPaths() // Add the tsconfig-paths plugin
  ],
  server: {
    port: 5173, // Keep the default port
    // Optional: Proxy API requests to backend to avoid CORS issues if needed later
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5001', // Your backend address
    //     changeOrigin: true,
    //   },
    // },
  },
});