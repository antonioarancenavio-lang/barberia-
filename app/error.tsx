'use client';

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="section-eyebrow">Ha ocurrido un error</p>
      <h1 className="font-display text-3xl text-ink">Algo se ha torcido.</h1>
      <p className="max-w-sm text-warm-700">
        No es culpa tuya. Prueba a recargar la página; si sigue fallando, avísanos.
      </p>
      <button onClick={() => reset()} className="btn-primary mt-2">
        Intentar de nuevo
      </button>
    </main>
  );
}
