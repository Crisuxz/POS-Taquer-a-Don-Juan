import { isRecord } from './guards.js';

export type HealthStatus = 'ok' | 'error';

export type DependencyStatus = 'up' | 'down';

export interface DependencyHealth {
  status: DependencyStatus;
  latencyMs: number;
}

/** Respuesta de `GET /api/health`. HTTP 200 si todo está bien, 503 si alguna dependencia falla. */
export interface HealthResponse {
  status: HealthStatus;
  /** Fecha/hora del servidor en UTC (ISO 8601). */
  timestamp: string;
  uptimeSeconds: number;
  checks: {
    database: DependencyHealth;
  };
}

export function isHealthResponse(value: unknown): value is HealthResponse {
  if (!isRecord(value) || !isRecord(value['checks'])) return false;
  const database = value['checks']['database'];
  if (!isRecord(database)) return false;
  return (
    (value['status'] === 'ok' || value['status'] === 'error') &&
    typeof value['timestamp'] === 'string' &&
    typeof value['uptimeSeconds'] === 'number' &&
    (database['status'] === 'up' || database['status'] === 'down') &&
    typeof database['latencyMs'] === 'number'
  );
}
