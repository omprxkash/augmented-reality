import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    target: 'es2020',
    chunkSizeWarningLimit: 600,
  },
  server: {
    // WebXR requires HTTPS on real devices.
    // For local dev use the WebXR emulator Chrome extension instead.
    port: 5173,
    host: true,
    open: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.js'],
  },
});
