import { ConfigService } from '@nestjs/config';
import { isHealthResponse, REQUEST_ID_HEADER, type HealthResponse } from '@pos/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Env } from '../src/config/env.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, type TestApp } from './create-test-app.js';

describe('GET /api/health', () => {
  describe('con PostgreSQL disponible', () => {
    let app: TestApp;

    beforeAll(async () => {
      app = await createTestApp();
    });

    afterAll(async () => {
      await app.close();
    });

    it('responde 200 con la base de datos arriba', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(200);
      const body = response.body as HealthResponse;

      expect(isHealthResponse(body)).toBe(true);
      expect(body.status).toBe('ok');
      expect(body.checks.database.status).toBe('up');
      expect(body.timestamp.endsWith('Z')).toBe(true);
    });

    it('devuelve un request id generado', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(200);
      expect(response.headers[REQUEST_ID_HEADER]).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('propaga un request id entrante válido', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .set(REQUEST_ID_HEADER, 'caja-01.req-42')
        .expect(200);
      expect(response.headers[REQUEST_ID_HEADER]).toBe('caja-01.req-42');
    });
  });

  describe('con PostgreSQL inaccesible', () => {
    let app: TestApp;

    beforeAll(async () => {
      // PrismaService real apuntando a un puerto sin servidor: sin mocks.
      app = await createTestApp({
        customize: (builder) =>
          builder.overrideProvider(PrismaService).useFactory({
            factory: (config: ConfigService<Env, true>) => {
              const unreachable = {
                get: (key: keyof Env) =>
                  key === 'DATABASE_URL'
                    ? 'postgresql://nadie:nada@127.0.0.1:1/inexistente'
                    : config.get(key, { infer: true }),
              } as ConfigService<Env, true>;
              return new PrismaService(unreachable);
            },
            inject: [ConfigService],
          }),
      });
    });

    afterAll(async () => {
      await app.close();
    });

    it('responde 503 y reporta la base de datos caída', async () => {
      const response = await request(app.getHttpServer()).get('/api/health').expect(503);
      const body = response.body as HealthResponse;

      expect(isHealthResponse(body)).toBe(true);
      expect(body.status).toBe('error');
      expect(body.checks.database.status).toBe('down');
      expect(JSON.stringify(body)).not.toContain('nada@');
    });
  });
});
