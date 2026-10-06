import {
  Catch,
  Logger,
  NotFoundException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { toApiError } from './to-api-error.js';

const SERVER_ERROR_MIN_STATUS = 500;

/**
 * Manejo global de errores HTTP: toda respuesta de error usa el formato
 * `ApiErrorResponse`. Los errores 5xx se registran con su stack; el cliente
 * solo recibe un mensaje genérico y el request id para correlacionar.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      this.logger.error('Excepción fuera de contexto HTTP', describeStack(exception));
      return;
    }

    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const path = request.originalUrl.split('?')[0] ?? '';

    const body = toApiError(exception, {
      path,
      requestId: request.requestId ?? 'desconocido',
      timestamp: new Date(),
      routeNotFound: isNestRouteNotFound(exception, request),
    });

    if (body.statusCode >= SERVER_ERROR_MIN_STATUS) {
      this.logger.error(
        `${request.method} ${path} -> ${body.statusCode} [${body.requestId}]`,
        describeStack(exception),
      );
    }

    response.status(body.statusCode).json(body);
  }
}

/**
 * El handler 404 de Nest (routes-resolver) lanza exactamente
 * `Cannot <MÉTODO> <URL>`; la prueba de integración de errores verifica que
 * esta detección siga vigente al actualizar Nest.
 */
function isNestRouteNotFound(exception: unknown, request: Request): boolean {
  return (
    exception instanceof NotFoundException &&
    exception.message === `Cannot ${request.method} ${request.originalUrl}`
  );
}

function describeStack(exception: unknown): string {
  return exception instanceof Error ? (exception.stack ?? exception.message) : String(exception);
}
