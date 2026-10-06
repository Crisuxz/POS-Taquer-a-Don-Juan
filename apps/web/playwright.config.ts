import { defineConfig, devices } from '@playwright/test';

// E2E contra la aplicación real ya compilada (`npm run build` en la raíz):
// levanta la API (con su PostgreSQL) y la Web en modo producción.
const CI = Boolean(process.env['CI']);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  // SPEC §31: prioridad tablet, luego escritorio.
  projects: [
    { name: 'tablet', use: { ...devices['Galaxy Tab S4 landscape'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'npm run start',
      cwd: '../api',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
    {
      command: 'npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: !CI,
      timeout: 60_000,
    },
  ],
});
