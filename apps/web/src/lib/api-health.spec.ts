import type { HealthResponse } from '@pos/shared';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkApiHealth, getApiBaseUrl } from './api-health';

const healthy: HealthResponse = {
  status: 'ok',
  timestamp: '2026-10-06T18:00:00.000Z',
  uptimeSeconds: 5,
  checks: { database: { status: 'up', latencyMs: 2 } },
};

function respondWith(body: unknown, status = 200): typeof fetch {
  return vi.fn(() => Promise.resolve(Response.json(body, { status })));
}

describe('checkApiHealth', () => {
  it('reporta online si la API y la base de datos responden', async () => {
    const fetchImpl = respondWith(healthy);
    await expect(checkApiHealth('http://api.local/api', fetchImpl)).resolves.toEqual({
      kind: 'online',
      health: healthy,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      'http://api.local/api/health',
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  it('reporta degraded si la API responde 503 con la base de datos caída', async () => {
    const unhealthy: HealthResponse = {
      ...healthy,
      status: 'error',
      checks: { database: { status: 'down', latencyMs: 5000 } },
    };
    const result = await checkApiHealth('http://api.local/api', respondWith(unhealthy, 503));
    expect(result).toEqual({ kind: 'degraded', health: unhealthy });
  });

  it('reporta offline ante un error de red', async () => {
    const fetchImpl = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    await expect(checkApiHealth('http://api.local/api', fetchImpl)).resolves.toEqual({
      kind: 'offline',
    });
  });

  it('reporta offline ante una respuesta con formato inesperado', async () => {
    const result = await checkApiHealth('http://api.local/api', respondWith({ hola: 'mundo' }));
    expect(result).toEqual({ kind: 'offline' });
  });
});

describe('getApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('devuelve la URL sin diagonal final', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api/');
    expect(getApiBaseUrl()).toBe('http://localhost:3001/api');
  });

  it('devuelve null si no está configurada', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    expect(getApiBaseUrl()).toBeNull();
  });
});
