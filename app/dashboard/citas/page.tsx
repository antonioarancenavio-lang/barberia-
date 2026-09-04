import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CitasClient } from './CitasClient';

export default async function CitasPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!barbershop) redirect('/register');

  const [{ data: services }, { data: barbers }] = await Promise.all([
    supabase
      .from('services')
      .select('id, name, duration_minutes')
      .eq('barbershop_id', barbershop.id)
      .eq('active', true),
    supabase.from('barbers').select('id, name').eq('barbershop_id', barbershop.id).eq('active', true),
  ]);

  return <CitasClient barbershopId={barbershop.id} services={services ?? []} barbers={barbers ?? []} />;
}
