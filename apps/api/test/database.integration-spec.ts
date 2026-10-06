import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, type TestApp } from './create-test-app.js';

interface AppliedMigration {
  migration_name: string;
  finished_at: Date | null;
  rolled_back_at: Date | null;
}

describe('PostgreSQL + Prisma', () => {
  let app: TestApp;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Prisma se conecta y ejecuta consultas', async () => {
    const rows = await prisma.$queryRaw<{ value: number }[]>`SELECT 1::int AS value`;
    expect(rows).toEqual([{ value: 1 }]);
  });

  it('las migraciones están aplicadas sin fallos', async () => {
    const migrations = await prisma.$queryRaw<AppliedMigration[]>`
      SELECT migration_name, finished_at, rolled_back_at
      FROM _prisma_migrations
      ORDER BY started_at`;

    const init = migrations.find((m) => m.migration_name.endsWith('_init_utc_timezone'));
    expect(init).toBeDefined();
    expect(init?.finished_at).not.toBeNull();
    expect(init?.rolled_back_at).toBeNull();
    expect(migrations.every((m) => m.finished_at !== null)).toBe(true);
  });

  it('la base de datos tiene UTC como zona horaria por defecto (SPEC §23)', async () => {
    const settings = await prisma.$queryRaw<{ setconfig: string[] }[]>`
      SELECT s.setconfig
      FROM pg_db_role_setting s
      JOIN pg_database d ON d.oid = s.setdatabase
      WHERE d.datname = current_database() AND s.setrole = 0`;
    expect(settings[0]?.setconfig).toContain('TimeZone=UTC');

    const [session] = await prisma.$queryRaw<
      { timezone: string }[]
    >`SELECT current_setting('TimeZone') AS timezone`;
    expect(session?.timezone).toBe('UTC');
  });
});
