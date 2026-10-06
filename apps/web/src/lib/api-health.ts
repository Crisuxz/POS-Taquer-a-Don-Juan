import { isHealthResponse, type HealthResponse } from '@pos/shared';

export type ApiHealthState =
  | { kind: 'loading' }
  | { kind: 'misconfigured' }
  | { kind: 'offline' }
  | { kind: 'online'; health: HealthResponse }
  | { kind: 'degraded'; health: HealthResponse };

export const HEALTH_TIMEOUT_MS = 5_000;

/** URL base de la API definida al compilar, o `null` si falta configurarla. */
export function getApiBaseUrl(): string | null {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim();
  return value ? value.replace(/\/+$/, '') : null;
}

/**
 * Consulta `GET /health` de la API. Nunca lanza: cualquier fallo de red,
 * timeout o respuesta inesperada se reporta como `offline`.
 */
export async function checkApiHealth(
  apiBaseUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<ApiHealthState> {
  try {
    const response = await fetchImpl(`${apiBaseUrl}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    const body: unknown = await response.json();
    if (!isHealthResponse(body)) return { kind: 'offline' };
    return body.status === 'ok'
      ? { kind: 'online', health: body }
      : { kind: 'degraded', health: body };
  } catch {
    return { kind: 'offline' };
  }
}
