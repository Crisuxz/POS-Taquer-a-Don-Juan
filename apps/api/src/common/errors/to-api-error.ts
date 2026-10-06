import { HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorResponse } from '@pos/shared';

export const INTERNAL_ERROR_MESSAGE = 'Ocurrió un error interno. Intenta de nuevo.';
export const ROUTE_NOT_FOUND_MESSAGE = 'La ruta solicitada no existe.';
const INVALID_REQUEST_MESSAGE = 'La solicitud contiene datos inválidos.';

interface RequestInfo {
  path: string;
  requestId: string;
  timestamp: Date;
  /** La petición no coincidió con ninguna ruta registrada. */
  routeNotFound?: boolean;
}

type ErrorBody = Pick<ApiErrorResponse, 'statusCode' | 'error' | 'message' | 'details'>;

/** Código estable a partir del status HTTP (p. ej. 404 -> NOT_FOUND). */
function errorCodeFor(statusCode: number): string {
  const name = (HttpStatus as Record<number, string | undefined>)[statusCode];
  return name ?? 'HTTP_ERROR';
}

function fromHttpException(exception: HttpException): ErrorBody {
  const statusCode = exception.getStatus();
  const error = errorCodeFor(statusCode);
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return { statusCode, error, message: response };
  }

  const { message } = response as { message?: unknown };
  if (Array.isArray(message)) {
    const details = message.filter((item): item is string => typeof item === 'string');
    return { statusCode, error, message: INVALID_REQUEST_MESSAGE, details };
  }
  return {
    statusCode,
    error,
    message: typeof message === 'string' ? message : exception.message,
  };
}

/**
 * Convierte cualquier excepción al formato uniforme `ApiErrorResponse`.
 * Los errores no controlados se reportan como 500 con un mensaje genérico:
 * su detalle interno nunca se envía al cliente.
 */
export function toApiError(exception: unknown, request: RequestInfo): ApiErrorResponse {
  let body: ErrorBody;
  if (request.routeNotFound) {
    // El 404 por defecto de Nest repite la URL con su query string.
    body = {
      statusCode: HttpStatus.NOT_FOUND,
      error: errorCodeFor(HttpStatus.NOT_FOUND),
      message: ROUTE_NOT_FOUND_MESSAGE,
    };
  } else if (exception instanceof HttpException) {
    body = fromHttpException(exception);
  } else {
    body = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: errorCodeFor(HttpStatus.INTERNAL_SERVER_ERROR),
      message: INTERNAL_ERROR_MESSAGE,
    };
  }

  return {
    ...body,
    path: request.path,
    requestId: request.requestId,
    timestamp: request.timestamp.toISOString(),
  };
}
