import { isRecord } from './guards.js';

/**
 * Formato uniforme de todas las respuestas de error de la API.
 * Lo produce el filtro global de excepciones del backend.
 */
export interface ApiErrorResponse {
  statusCode: number;
  /** Código estable, legible por máquina (p. ej. `NOT_FOUND`). */
  error: string;
  /** Mensaje para el usuario. Nunca incluye detalles internos ni datos sensibles. */
  message: string;
  /** Detalles de validación opcionales (p. ej. campos inválidos). */
  details?: string[];
  path: string;
  requestId: string;
  /** Fecha/hora del servidor en UTC (ISO 8601). */
  timestamp: string;
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value)) return false;
  return (
    typeof value['statusCode'] === 'number' &&
    typeof value['error'] === 'string' &&
    typeof value['message'] === 'string' &&
    typeof value['path'] === 'string' &&
    typeof value['requestId'] === 'string' &&
    typeof value['timestamp'] === 'string'
  );
}
