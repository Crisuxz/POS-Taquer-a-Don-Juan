import { describe, expect, it } from 'vitest';
import { logLevelsFrom } from './app-logger.js';

describe('logLevelsFrom', () => {
  it('incluye el umbral y los niveles más severos', () => {
    expect(logLevelsFrom('fatal')).toEqual(['fatal']);
    expect(logLevelsFrom('warn')).toEqual(['fatal', 'error', 'warn']);
    expect(logLevelsFrom('log')).toEqual(['fatal', 'error', 'warn', 'log']);
  });

  it('verbose habilita todos los niveles', () => {
    expect(logLevelsFrom('verbose')).toEqual(['fatal', 'error', 'warn', 'log', 'debug', 'verbose']);
  });
});
