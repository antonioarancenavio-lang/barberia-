import { createClient } from '@/lib/supabase/server';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
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
      <h1 className="text-2xl font-bold">Hoy</h1>
      <p className="mt-1 capitalize text-gray-500">
        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {(!appointments || appointments.length === 0) && (
          <p className="text-gray-400">No tienes citas hoy.</p>
        )}
        {appointments?.map((a: any) => (
          <div
            key={a.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {new Date(a.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ·{' '}
                {a.client_name}
              </p>
              <p className="text-sm text-gray-500">
                {a.services?.name} con {a.barbers?.name} · {a.client_phone}
              </p>
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
              {STATUS_LABELS[a.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
