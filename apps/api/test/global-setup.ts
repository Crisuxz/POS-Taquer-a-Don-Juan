import { execSync } from 'node:child_process';

/**
 * Aplica las migraciones a la base de pruebas antes de ejecutar la suite.
 * Así cada corrida valida también que las migraciones se aplican sin error.
 */
export default function setup(): void {
  const databaseUrl = process.env['DATABASE_URL_TEST'];
  if (!databaseUrl) throw new Error('DATABASE_URL_TEST no está definida.');

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: databaseUrl },
  });
}
