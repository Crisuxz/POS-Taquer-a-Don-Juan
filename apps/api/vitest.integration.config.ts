import { existsSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

// Pruebas de integración: levantan la aplicación Nest completa contra un
// PostgreSQL real (base de datos de pruebas, nunca la de desarrollo).
if (existsSync('.env')) process.loadEnvFile('.env');

const testDatabaseUrl = process.env['DATABASE_URL_TEST'];
if (!testDatabaseUrl) {
  throw new Error('DATABASE_URL_TEST es obligatoria para las pruebas de integración.');
}
if (testDatabaseUrl === process.env['DATABASE_URL']) {
  throw new Error('DATABASE_URL_TEST debe apuntar a una base distinta a DATABASE_URL.');
}

export default defineConfig({
  test: {
    include: ['test/**/*.integration-spec.ts'],
    environment: 'node',
    globalSetup: ['test/global-setup.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: testDatabaseUrl,
      LOG_LEVEL: 'warn',
    },
    testTimeout: 20_000,
    hookTimeout: 30_000,
    // Comparten una sola base de datos: se ejecutan de forma secuencial.
    fileParallelism: false,
  },
});
