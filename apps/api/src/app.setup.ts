import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST_ID_HEADER } from '@pos/shared';
import helmet from 'helmet';
import type { Env } from './config/env.js';

export const API_PREFIX = 'api';

/**
 * Configuración HTTP común a `main.ts` y a las pruebas de integración, para
 * que las pruebas ejerciten exactamente la misma aplicación.
 */
export function configureApp(app: INestApplication): void {
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.enableCors({
    origin: config.get('CORS_ORIGINS', { infer: true }),
    exposedHeaders: [REQUEST_ID_HEADER],
  });
  app.enableShutdownHooks();
}
