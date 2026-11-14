import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Relative base so the build works on GitHub Pages project sites (/<repo>/) and locally.
export default defineConfig({
  base: './',
  optimizeDeps: { exclude: ['maplibre-gl'] },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html'), method: resolve(__dirname, 'method.html') },
    },
  },
  test: { environment: 'node' },
} as any);
