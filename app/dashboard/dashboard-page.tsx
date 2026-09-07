import { createClient } from '@/lib/supabase/server';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-accent/10 text-accent-dark',
  confirmed: 'bg-ink text-bg',
  completed: 'bg-warm-300 text-ink',
  cancelled: 'bg-warm-100 text-warm-500',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default async function DashboardHome() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('id')
    .eq('owner_id', user!.id)
    .maybeSingle();

  const todayISO = new Date().toISOString().slice(0, 10);

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, client_name, client_phone, start_time, status, services(name), barbers(name)')
    .eq('barbershop_id', barbershop!.id)
    .gte('start_time', `${todayISO}T00:00:00`)
    .lte('start_time', `${todayISO}T23:59:59`)
    .order('start_time');

  return (
    <div>
      <p className="section-eyebrow">Agenda</p>
      <h1 className="font-display text-3xl text-ink">Hoy</h1>
      <p className="mt-1 capitalize text-warm-500">
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      <div className="mt-8 flex flex-col gap-2">
        {(!appointments || appointments.length === 0) && (
          <p className="text-warm-500">No tienes citas hoy. Momento perfecto para afilar herramientas.</p>
        )}
        {appointments?.map((a: any) => (
          <div key={a.id} className="card-base flex items-center justify-between !p-4">
            <div>
              <p className="font-medium text-ink">
                {new Date(a.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {a.client_name}
              </p>
              <p className="text-sm text-warm-500">
                {a.services?.name} con {a.barbers?.name} · {a.client_phone}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
              {STATUS_LABELS[a.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
