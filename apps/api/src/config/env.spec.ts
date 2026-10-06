import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.js';

const DATABASE_URL = 'postgresql://user:super-secret@localhost:5432/pos';

describe('validateEnv', () => {
  it('aplica valores por defecto', () => {
    expect(validateEnv({ DATABASE_URL })).toEqual({
      NODE_ENV: 'development',
      PORT: 3001,
      DATABASE_URL,
      CORS_ORIGINS: ['http://localhost:3000'],
      LOG_LEVEL: 'log',
    });
  });

  it('convierte PORT a número y separa CORS_ORIGINS', () => {
    const env = validateEnv({
      DATABASE_URL,
      PORT: '4000',
      CORS_ORIGINS: 'http://a.local, http://b.local ,',
      NODE_ENV: 'production',
      LOG_LEVEL: 'warn',
    });
    expect(env.PORT).toBe(4000);
    expect(env.CORS_ORIGINS).toEqual(['http://a.local', 'http://b.local']);
    expect(env.NODE_ENV).toBe('production');
    expect(env.LOG_LEVEL).toBe('warn');
  });

  it('exige DATABASE_URL', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('rechaza una DATABASE_URL que no es de PostgreSQL sin exponer su valor', () => {
    const secretUrl = 'mysql://root:super-secret@localhost/pos';
    let message = '';
    try {
      validateEnv({ DATABASE_URL: secretUrl });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/DATABASE_URL/);
    expect(message).not.toContain('super-secret');
  });

  it.each([['0'], ['70000'], ['abc']])('rechaza PORT inválido (%s)', (PORT) => {
    expect(() => validateEnv({ DATABASE_URL, PORT })).toThrow(/PORT/);
  });

  it('rechaza NODE_ENV y LOG_LEVEL desconocidos', () => {
    expect(() => validateEnv({ DATABASE_URL, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
    expect(() => validateEnv({ DATABASE_URL, LOG_LEVEL: 'trace' })).toThrow(/LOG_LEVEL/);
  });
});
