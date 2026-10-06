import { describe, expect, it } from 'vitest';
import { isHealthResponse, type HealthResponse } from './health.js';

const valid: HealthResponse = {
  status: 'ok',
  timestamp: '2026-10-06T12:00:00.000Z',
  uptimeSeconds: 12,
  checks: { database: { status: 'up', latencyMs: 3 } },
};

describe('isHealthResponse', () => {
  it('acepta una respuesta válida', () => {
    expect(isHealthResponse(valid)).toBe(true);
    expect(
      isHealthResponse({
        ...valid,
        status: 'error',
        checks: { database: { status: 'down', latencyMs: 0 } },
      }),
    ).toBe(true);
  });

  it.each([
    ['null', null],
    ['texto', 'ok'],
    ['estado desconocido', { ...valid, status: 'degraded' }],
    ['sin checks', { ...valid, checks: undefined }],
    ['database inválida', { ...valid, checks: { database: { status: 'maybe', latencyMs: 1 } } }],
    ['uptime no numérico', { ...valid, uptimeSeconds: '12' }],
  ])('rechaza %s', (_label, value) => {
    expect(isHealthResponse(value)).toBe(false);
  });
});
