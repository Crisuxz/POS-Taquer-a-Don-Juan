'use client';

import { useEffect, useState } from 'react';
import { checkApiHealth, type ApiHealthState } from '@/lib/api-health';

interface SystemStatusProps {
  apiBaseUrl: string | null;
}

type Tone = 'ok' | 'warning' | 'error' | 'neutral';

const TONE_CLASSES: Record<Tone, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  neutral: 'bg-zinc-400',
};

function describe(state: ApiHealthState): { api: [Tone, string]; database: [Tone, string] } {
  switch (state.kind) {
    case 'loading':
      return { api: ['neutral', 'Verificando…'], database: ['neutral', 'Verificando…'] };
    case 'misconfigured':
      return {
        api: ['error', 'Falta configurar NEXT_PUBLIC_API_URL'],
        database: ['neutral', 'Sin datos'],
      };
    case 'offline':
      return { api: ['error', 'Sin conexión con la API'], database: ['neutral', 'Sin datos'] };
    case 'online':
    case 'degraded':
      return {
        api: ['ok', 'API conectada'],
        database:
          state.health.checks.database.status === 'up'
            ? ['ok', 'Base de datos conectada']
            : ['warning', 'Base de datos no disponible'],
      };
  }
}

function StatusRow({ label, tone, text }: { label: string; tone: Tone; text: string }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <span className="font-medium">{label}</span>
      <span className="flex items-center gap-2">
        <span aria-hidden className={`h-3 w-3 rounded-full ${TONE_CLASSES[tone]}`} />
        <span>{text}</span>
      </span>
    </li>
  );
}

/** Estado técnico de la plataforma: conectividad con la API y la base de datos. */
export function SystemStatus({ apiBaseUrl }: SystemStatusProps) {
  const [state, setState] = useState<ApiHealthState>(
    apiBaseUrl ? { kind: 'loading' } : { kind: 'misconfigured' },
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!apiBaseUrl) return;
    let cancelled = false;
    void checkApiHealth(apiBaseUrl).then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, attempt]);

  const retry = () => {
    setState({ kind: 'loading' });
    setAttempt((value) => value + 1);
  };

  const { api, database } = describe(state);

  return (
    <section aria-labelledby="system-status-title" className="w-full max-w-md">
      <h2 id="system-status-title" className="mb-3 text-lg font-semibold">
        Estado del sistema
      </h2>
      <ul className="flex flex-col gap-2" aria-live="polite">
        <StatusRow label="Servidor" tone={api[0]} text={api[1]} />
        <StatusRow label="Datos" tone={database[0]} text={database[1]} />
      </ul>
      {apiBaseUrl && state.kind !== 'loading' && state.kind !== 'online' ? (
        <button
          type="button"
          onClick={retry}
          className="mt-4 min-h-12 w-full rounded-lg bg-zinc-900 px-4 font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Reintentar
        </button>
      ) : null}
    </section>
  );
}
