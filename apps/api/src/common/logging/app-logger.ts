import { ConsoleLogger, type LogLevel } from '@nestjs/common';
import { LOG_LEVELS, type AppLogLevel, type Env } from '../../config/env.js';

/** Niveles habilitados para un umbral: el umbral y todos los más severos. */
export function logLevelsFrom(threshold: AppLogLevel): LogLevel[] {
  return LOG_LEVELS.slice(0, LOG_LEVELS.indexOf(threshold) + 1);
}

/**
 * Logger de la aplicación: JSON en producción (para agregadores de logs) y
 * texto con colores en desarrollo. Nunca se registran cuerpos de petición,
 * headers ni query strings (pueden contener contraseñas, PIN o tokens).
 */
export function createAppLogger(env: Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>): ConsoleLogger {
  const production = env.NODE_ENV === 'production';
  return new ConsoleLogger('PosApi', {
    json: production,
    colors: !production,
    logLevels: logLevelsFrom(env.LOG_LEVEL),
  });
}
