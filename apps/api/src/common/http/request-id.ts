import { randomUUID } from 'node:crypto';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- extensión de tipos de Express
  namespace Express {
    interface Request {
      /** Identificador de correlación asignado por RequestContextMiddleware. */
      requestId?: string;
    }
  }
}

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

/**
 * Reutiliza el request id entrante (p. ej. de un proxy) solo si es seguro
 * para escribirlo en logs; de lo contrario genera uno nuevo.
 */
export function resolveRequestId(incoming: string | undefined): string {
  return incoming !== undefined && SAFE_REQUEST_ID.test(incoming) ? incoming : randomUUID();
}
