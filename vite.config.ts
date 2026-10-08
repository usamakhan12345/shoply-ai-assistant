import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

// In development the browser talks only to Vite (:5173); /api and /uploads are proxied to FastAPI (:8000).
// That avoids CORS entirely while developing.
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/uploads': 'http://127.0.0.1:8000',
    },
  },
  css: { preprocessorOptions: { scss: { api: 'modern-compiler' } } },
  test: { environment: 'node' },
});
