import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Placeholder de Fase 2: solo demuestra que el middleware resolvio
// correctamente el slug del subdominio. La pagina publica completa
// (servicios, barberos, horarios, boton de reserva) se construye en la Fase 3.
export default async function TenantPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_barbershop_public', {
    check_slug: params.slug,
  });

  const barbershop = Array.isArray(data) ? data[0] : null;

  if (error || !barbershop) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold">{barbershop.name}</h1>
      <p className="mt-2 text-gray-600">{barbershop.city}</p>
      <p className="mt-8 text-sm text-gray-400">
        Servicios, barberos, horarios y reserva llegan en la Fase 3.
      </p>
    </main>
  );
}
