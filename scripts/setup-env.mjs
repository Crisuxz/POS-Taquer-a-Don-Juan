// Copia cada .env.example a su archivo de entorno local si aún no existe.
// Nunca sobrescribe archivos existentes.
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const targets = [
  ['.env.example', '.env'],
  ['apps/api/.env.example', 'apps/api/.env'],
  ['apps/web/.env.example', 'apps/web/.env.local'],
];

for (const [example, target] of targets) {
  const source = join(root, example);
  const destination = join(root, target);
  if (existsSync(destination)) {
    console.log(`= ${target} ya existe, se conserva`);
    continue;
  }
  copyFileSync(source, destination);
  console.log(`+ ${target} creado desde ${example}`);
}
