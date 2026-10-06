import { defineConfig } from 'vitest/config';

// Pruebas unitarias: rápidas, sin base de datos ni red.
export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts'],
    environment: 'node',
  },
});
