import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Placeholder de Fase 1: solo demuestra que la ruta esta protegida y que
// RLS filtra correctamente la barberia del usuario. El dashboard completo
// (citas, calendario, servicios, barberos, horarios) se construye en la Fase 4.
export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Panel de {barbershop?.name ?? 'tu barbería'}</h1>
      <p className="mt-2 text-gray-600">
        Subdominio: <code>{barbershop?.slug}.midominio.com</code>
      </p>
      <p className="mt-6 text-sm text-gray-400">
        Calendario, servicios, barberos y horarios llegan en la Fase 4.
      </p>
    </main>
  );
}
