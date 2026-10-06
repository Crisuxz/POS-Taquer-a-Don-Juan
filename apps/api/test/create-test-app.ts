import type { INestApplication, Type } from '@nestjs/common';
import { Test, type TestingModuleBuilder } from '@nestjs/testing';
import type request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

interface TestAppOptions {
  /** Controladores extra, solo para pruebas (p. ej. para provocar errores). */
  controllers?: Type[];
  /** Permite sustituir proveedores puntuales. */
  customize?: (builder: TestingModuleBuilder) => TestingModuleBuilder;
}

/** Tipo de servidor HTTP que acepta supertest. */
type HttpApp = Parameters<typeof request>[0];

export type TestApp = INestApplication<HttpApp>;

/**
 * Levanta la aplicación real (mismos módulos, filtros, middleware y setup que
 * producción) para pruebas de integración.
 */
export async function createTestApp(options: TestAppOptions = {}): Promise<TestApp> {
  const { controllers = [], customize = (builder) => builder } = options;
  const builder = Test.createTestingModule({ imports: [AppModule], controllers });
  const moduleRef = await customize(builder).compile();

  const app = moduleRef.createNestApplication<TestApp>({ logger: ['fatal'] });
  configureApp(app);
  await app.init();
  return app;
}
