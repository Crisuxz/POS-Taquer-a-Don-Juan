import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Pruebas unitarias de componentes y lógica de cliente (jsdom).
// Las pruebas E2E en navegador real viven en e2e/ y usan Playwright.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.join(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
