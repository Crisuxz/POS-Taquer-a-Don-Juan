import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { API_PREFIX, configureApp } from './app.setup.js';
import { createAppLogger } from './common/logging/app-logger.js';
import type { Env } from './config/env.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.useLogger(
    createAppLogger({
      NODE_ENV: config.get('NODE_ENV', { infer: true }),
      LOG_LEVEL: config.get('LOG_LEVEL', { infer: true }),
    }),
  );
  configureApp(app);

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  new Logger('Bootstrap').log(`API escuchando en el puerto ${port} (/${API_PREFIX})`);
}

await bootstrap();
