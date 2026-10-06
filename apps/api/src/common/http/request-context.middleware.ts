import { Injectable, Logger, type NestMiddleware } from '@nestjs/common';
import { REQUEST_ID_HEADER } from '@pos/shared';
import type { NextFunction, Request, Response } from 'express';
import { resolveRequestId } from './request-id.js';

/**
 * Asigna un request id a cada petición (header de respuesta incluido) y
 * registra una línea de acceso al terminar: método, ruta sin query string,
 * status y duración.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = resolveRequestId(request.header(REQUEST_ID_HEADER));
    request.requestId = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);

    const startedAt = performance.now();
    response.on('finish', () => {
      const path = request.originalUrl.split('?')[0] ?? '';
      const durationMs = (performance.now() - startedAt).toFixed(1);
      this.logger.log(
        `${request.method} ${path} ${response.statusCode} ${durationMs}ms [${requestId}]`,
      );
    });

    next();
  }
}
