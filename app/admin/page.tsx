import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminClient } from './AdminClient';

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'platform_admin') {
    redirect('/dashboard');
  }

  const [{ data: barbershops }, { count: totalUsers }, { count: totalAppointments }] = await Promise.all([
    supabase
      .from('barbershops')
      .select('id, name, slug, city, status, plan, created_at, appointments(count)')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('appointments').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <AdminClient
      initialBarbershops={barbershops ?? []}
      totalUsers={totalUsers ?? 0}
      totalAppointments={totalAppointments ?? 0}
    />
  );
}
