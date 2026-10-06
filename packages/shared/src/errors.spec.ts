import { describe, expect, it } from 'vitest';
import { isApiErrorResponse, type ApiErrorResponse } from './errors.js';

const valid: ApiErrorResponse = {
  statusCode: 404,
  error: 'NOT_FOUND',
  message: 'Recurso no encontrado',
  path: '/api/nada',
  requestId: '6f1c1d2e-0000-4000-8000-000000000000',
  timestamp: '2026-10-06T12:00:00.000Z',
};

describe('isApiErrorResponse', () => {
  it('acepta un error válido, con o sin detalles', () => {
    expect(isApiErrorResponse(valid)).toBe(true);
    expect(isApiErrorResponse({ ...valid, details: ['campo requerido'] })).toBe(true);
  });

  it.each([
    ['undefined', undefined],
    ['arreglo', []],
    ['sin statusCode', { ...valid, statusCode: undefined }],
    ['sin requestId', { ...valid, requestId: undefined }],
    ['mensaje no textual', { ...valid, message: 42 }],
  ])('rechaza %s', (_label, value) => {
    expect(isApiErrorResponse(value)).toBe(false);
  });
});
