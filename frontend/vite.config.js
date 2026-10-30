import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Requests to /api are forwarded to the backend (default http://localhost:5000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
