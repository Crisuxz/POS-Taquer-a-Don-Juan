import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { INTERNAL_ERROR_MESSAGE, ROUTE_NOT_FOUND_MESSAGE, toApiError } from './to-api-error.js';

const request = {
  path: '/api/recurso',
  requestId: 'req-1',
  timestamp: new Date('2026-10-06T18:30:00.000Z'),
};

describe('toApiError', () => {
  it('mapea una HttpException con mensaje propio', () => {
    expect(toApiError(new NotFoundException('Mesa no encontrada'), request)).toEqual({
      statusCode: 404,
      error: 'NOT_FOUND',
      message: 'Mesa no encontrada',
      path: '/api/recurso',
      requestId: 'req-1',
      timestamp: '2026-10-06T18:30:00.000Z',
    });
  });

  it('usa el mensaje por defecto de Nest si no se especifica', () => {
    const result = toApiError(new ForbiddenException(), request);
    expect(result.statusCode).toBe(403);
    expect(result.error).toBe('FORBIDDEN');
    expect(result.message).toBe('Forbidden');
  });

  it('convierte listas de validación en details', () => {
    const exception = new BadRequestException(['cantidad debe ser positiva', 'nombre requerido']);
    const result = toApiError(exception, request);
    expect(result.statusCode).toBe(400);
    expect(result.error).toBe('BAD_REQUEST');
    expect(result.message).toBe('La solicitud contiene datos inválidos.');
    expect(result.details).toEqual(['cantidad debe ser positiva', 'nombre requerido']);
  });

  it('acepta una respuesta de tipo string', () => {
    const result = toApiError(new HttpException('Demasiadas solicitudes', 429), request);
    expect(result).toMatchObject({
      statusCode: 429,
      error: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes',
    });
  });

  it('usa un código genérico para status sin nombre conocido', () => {
    expect(toApiError(new HttpException('raro', 499), request).error).toBe('HTTP_ERROR');
  });

  it('oculta el detalle de errores no controlados', () => {
    const result = toApiError(
      new Error('connect ECONNREFUSED postgresql://pos:secreto@db'),
      request,
    );
    expect(result).toEqual({
      statusCode: 500,
      error: 'INTERNAL_SERVER_ERROR',
      message: INTERNAL_ERROR_MESSAGE,
      path: '/api/recurso',
      requestId: 'req-1',
      timestamp: '2026-10-06T18:30:00.000Z',
    });
    expect(JSON.stringify(result)).not.toContain('secreto');
  });

  it('usa un mensaje genérico para rutas inexistentes (sin reflejar la URL)', () => {
    const exception = new NotFoundException('Cannot GET /api/nada?token=secreto');
    const result = toApiError(exception, { ...request, routeNotFound: true });
    expect(result).toMatchObject({
      statusCode: 404,
      error: 'NOT_FOUND',
      message: ROUTE_NOT_FOUND_MESSAGE,
    });
    expect(JSON.stringify(result)).not.toContain('secreto');
  });

  it('maneja valores lanzados que no son Error', () => {
    expect(toApiError('fallo', request).statusCode).toBe(500);
    expect(toApiError(undefined, request).statusCode).toBe(500);
  });
});
