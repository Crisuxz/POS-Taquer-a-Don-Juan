import path from 'node:path';
import type { NextConfig } from 'next';

// Raíz del monorepo: permite resolver y empaquetar @pos/shared (workspace).
const monorepoRoot = path.join(import.meta.dirname, '..', '..');

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  // Solo el build de Docker genera la salida standalone (en Windows requiere
  // symlinks con privilegios; ver docs/DEPLOYMENT.md).
  output: process.env['NEXT_OUTPUT'] === 'standalone' ? 'standalone' : undefined,
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
