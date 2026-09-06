import Link from 'next/link';

// Placeholder de comprobacion visual para la Fase A (sistema de diseño).
// La landing completa (hero, storytelling, pricing, FAQ...) se construye en la Fase B.
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="eyebrow-label">Cortia</p>
      <h1 className="max-w-xl font-display text-5xl font-medium leading-tight tracking-tight text-ink">
        Tu barbería. Tu agenda. Todo bajo control.
      </h1>
      <p className="max-w-md text-warm-700">
        Gestiona tus citas, barberos y reservas online desde un solo lugar.
      </p>
      <div className="flex gap-4">
        <Link href="/register" className="btn-primary">
          Empezar gratis
        </Link>
        <Link href="/login" className="btn-secondary">
          Iniciar sesión
        </Link>
      </div>
    </main>
  );
}
