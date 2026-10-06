import { Controller, Get, NotFoundException } from '@nestjs/common';
import { isApiErrorResponse, REQUEST_ID_HEADER, type ApiErrorResponse } from '@pos/shared';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  INTERNAL_ERROR_MESSAGE,
  ROUTE_NOT_FOUND_MESSAGE,
} from '../src/common/errors/to-api-error.js';
import { createTestApp, type TestApp } from './create-test-app.js';

// Controlador exclusivo de esta prueba para provocar errores controlados y no controlados.
@Controller('test-errors')
class ErrorsProbeController {
  @Get('not-found')
  notFound(): never {
    throw new NotFoundException('Mesa no encontrada');
  }

  @Get('crash')
  crash(): never {
    throw new Error('fallo interno con secreto postgresql://pos:clave@db');
  }
}

describe('Manejo global de errores y seguridad HTTP', () => {
  let app: TestApp;

  beforeAll(async () => {
    app = await createTestApp({ controllers: [ErrorsProbeController] });
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 404 uniforme en rutas inexistentes, sin reflejar la query string', async () => {
    const response = await request(app.getHttpServer()).get('/api/no-existe?token=abc').expect(404);
    const body = response.body as ApiErrorResponse;

    expect(isApiErrorResponse(body)).toBe(true);
    expect(body.error).toBe('NOT_FOUND');
    expect(body.path).toBe('/api/no-existe');
    expect(body.message).toBe(ROUTE_NOT_FOUND_MESSAGE);
    expect(response.text).not.toContain('token=abc');
    expect(body.requestId).toBe(response.headers[REQUEST_ID_HEADER]);
  });

  it('respeta el mensaje de una HttpException controlada', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/test-errors/not-found')
      .expect(404);
    const body = response.body as ApiErrorResponse;

    expect(isApiErrorResponse(body)).toBe(true);
    expect(body.message).toBe('Mesa no encontrada');
  });

  it('responde 500 genérico ante un error no controlado, sin filtrar detalles', async () => {
    const response = await request(app.getHttpServer()).get('/api/test-errors/crash').expect(500);
    const body = response.body as ApiErrorResponse;

    expect(isApiErrorResponse(body)).toBe(true);
    expect(body.error).toBe('INTERNAL_SERVER_ERROR');
    expect(body.message).toBe(INTERNAL_ERROR_MESSAGE);
    expect(response.text).not.toContain('clave');
    expect(response.text).not.toContain('postgresql://');
  });

  it('aplica headers de seguridad (helmet)', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('permite CORS solo a orígenes configurados y expone el request id', async () => {
    const allowed = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'http://localhost:3000');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(allowed.headers['access-control-expose-headers']).toContain(REQUEST_ID_HEADER);

    const denied = await request(app.getHttpServer())
      .get('/api/health')
      .set('Origin', 'http://malicioso.example');
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();
  });
});
