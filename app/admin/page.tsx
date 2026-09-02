import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Placeholder de Fase 1. El panel completo (listado de barberias, suspender,
// ingresos, planes) se construye en la Fase 5.
export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'platform_admin') {
    redirect('/dashboard');
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl font-bold">Panel de administrador</h1>
      <p className="mt-2 text-gray-600">
        Listado de barberías, suscripciones e ingresos llegan en la Fase 5.
      </p>
    </main>
  );
}
