import Link from 'next/link';

// Landing completa (features, precios, FAQ) se desarrollara con detalle en
// una fase posterior de UI. Esta version minima solo deja el flujo de auth navegable.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        Tu barbería, tus citas, todo en un solo lugar.
      </h1>
      <div className="flex gap-4">
        <Link
          href="/register"
          className="rounded-lg bg-brand px-6 py-3 text-white hover:bg-brand-light"
        >
          Crear mi barbería
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-50"
        >
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
