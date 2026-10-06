import { describe, expect, it } from 'vitest';
import { resolveRequestId } from './request-id.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('resolveRequestId', () => {
  it('conserva un id entrante seguro', () => {
    expect(resolveRequestId('abc-123_DEF.9')).toBe('abc-123_DEF.9');
  });

  it('genera un UUID si no hay id entrante', () => {
    expect(resolveRequestId(undefined)).toMatch(UUID);
  });

  it.each([[''], ['con espacios'], ['salto\nde-linea'], ['x'.repeat(129)], ['<script>']])(
    'reemplaza ids inseguros (%j)',
    (incoming) => {
      expect(resolveRequestId(incoming)).toMatch(UUID);
    },
  );
});
