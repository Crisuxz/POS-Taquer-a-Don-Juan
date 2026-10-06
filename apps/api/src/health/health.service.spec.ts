import { describe, expect, it } from 'vitest';
import { isHealthResponse } from '@pos/shared';
import type { PrismaService } from '../prisma/prisma.service.js';
import { HealthService } from './health.service.js';

// Prueba unitaria con un doble mínimo de Prisma; la integración real contra
// PostgreSQL está en test/health.integration-spec.ts.
function serviceWith(queryRaw: () => Promise<unknown>): HealthService {
  return new HealthService({ $queryRaw: queryRaw } as unknown as PrismaService);
}

describe('HealthService', () => {
  it('reporta ok cuando la base de datos responde', async () => {
    const result = await serviceWith(() => Promise.resolve([{ '?column?': 1 }])).check();
    expect(isHealthResponse(result)).toBe(true);
    expect(result.status).toBe('ok');
    expect(result.checks.database.status).toBe('up');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('reporta error cuando la base de datos falla', async () => {
    const result = await serviceWith(() => Promise.reject(new Error('ECONNREFUSED'))).check();
    expect(result.status).toBe('error');
    expect(result.checks.database.status).toBe('down');
  });
});
