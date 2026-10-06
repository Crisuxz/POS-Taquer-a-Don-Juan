import type { HealthResponse } from '@pos/shared';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SystemStatus } from './system-status';

const healthy: HealthResponse = {
  status: 'ok',
  timestamp: '2026-10-06T18:00:00.000Z',
  uptimeSeconds: 5,
  checks: { database: { status: 'up', latencyMs: 2 } },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('<SystemStatus />', () => {
  it('muestra API y base de datos conectadas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(healthy))),
    );
    render(<SystemStatus apiBaseUrl="http://api.local/api" />);

    expect(await screen.findByText('API conectada')).toBeInTheDocument();
    expect(screen.getByText('Base de datos conectada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('muestra base de datos no disponible cuando la API responde 503', async () => {
    const degraded: HealthResponse = {
      ...healthy,
      status: 'error',
      checks: { database: { status: 'down', latencyMs: 0 } },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(Response.json(degraded, { status: 503 }))),
    );
    render(<SystemStatus apiBaseUrl="http://api.local/api" />);

    expect(await screen.findByText('Base de datos no disponible')).toBeInTheDocument();
  });

  it('muestra sin conexión y permite reintentar', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(Response.json(healthy));
    vi.stubGlobal('fetch', fetchMock);
    render(<SystemStatus apiBaseUrl="http://api.local/api" />);

    expect(await screen.findByText('Sin conexión con la API')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('API conectada')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('indica la configuración faltante sin llamar a la red', () => {
    const fetchMock = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchMock);
    render(<SystemStatus apiBaseUrl={null} />);

    expect(screen.getByText('Falta configurar NEXT_PUBLIC_API_URL')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
