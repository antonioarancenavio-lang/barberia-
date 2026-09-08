import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="section-eyebrow">Error 404</p>
      <h1 className="font-display text-3xl text-ink">Esto no está por aquí.</h1>
      <p className="max-w-sm text-warm-700">
        La página que buscas no existe o se ha movido. Comprueba la dirección o vuelve al inicio.
      </p>
      <Link href="/" className="btn-primary mt-2">
        Volver al inicio
      </Link>
    </main>
  );
}
