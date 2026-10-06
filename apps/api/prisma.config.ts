import { existsSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Desde Prisma 7 el CLI no carga .env automáticamente. Las variables ya
// definidas en el entorno (CI, Docker) tienen prioridad sobre el archivo.
if (existsSync('.env')) process.loadEnvFile('.env');

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Opcional para `prisma generate`; obligatoria para migraciones.
    url: process.env['DATABASE_URL'],
  },
});
