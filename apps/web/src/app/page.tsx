import { SystemStatus } from '@/components/system-status';
import { getApiBaseUrl } from '@/lib/api-health';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Taquería Don Juan</h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">Punto de venta</p>
      </header>
      <SystemStatus apiBaseUrl={getApiBaseUrl()} />
    </main>
  );
}
