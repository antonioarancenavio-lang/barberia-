'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Service = { id: string; name: string; duration_minutes: number };
type Barber = { id: string; name: string };
type Appointment = {
  id: string;
  client_name: string;
  client_phone: string;
  start_time: string;
  end_time: string;
  status: string;
  services: { name: string } | null;
  barbers: { name: string } | null;
  barber_id: string;
};

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

export function CitasClient({
  barbershopId,
  services,
  barbers,
}: {
  barbershopId: string;
  services: Service[];
  barbers: Barber[];
}) {
  const supabase = createClient();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [newServiceId, setNewServiceId] = useState('');
  const [newBarberId, setNewBarberId] = useState('');
  const [newTime, setNewTime] = useState('10:00');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  async function loadAppointments() {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('id, client_name, client_phone, start_time, end_time, status, barber_id, services(name), barbers(name)')
      .eq('barbershop_id', barbershopId)
      .gte('start_time', `${date}T00:00:00`)
      .lte('start_time', `${date}T23:59:59`)
      .order('start_time');
    setAppointments((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id);
    loadAppointments();
  }

  async function cancelAppointment(id: string) {
    await updateStatus(id, 'cancelled');
  }

  async function handleCreate() {
    setFormError(null);
    if (!newServiceId || !newBarberId || !newClientName || !newClientPhone) {
      setFormError('Rellena todos los campos.');
      return;
    }
    const service = services.find((s) => s.id === newServiceId);
    if (!service) return;

    const start = new Date(`${date}T${newTime}:00`);
    const end = new Date(start.getTime() + service.duration_minutes * 60000);

    setSaving(true);
    const { error } = await supabase.from('appointments').insert({
      barbershop_id: barbershopId,
      barber_id: newBarberId,
      service_id: newServiceId,
      client_name: newClientName,
      client_phone: newClientPhone,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'confirmed',
    });

    if (error) {
      setFormError('Ese barbero ya tiene una cita a esa hora.');
      setSaving(false);
      return;
    }

    setSaving(false);
    setShowForm(false);
    setNewClientName('');
    setNewClientPhone('');
    loadAppointments();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Citas</h1>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-brand px-4 py-1.5 text-sm text-white hover:bg-brand-light"
          >
            + Nueva cita
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={newServiceId}
              onChange={(e) => setNewServiceId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <select
              value={newBarberId}
              onChange={(e) => setNewBarberId(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Barbero</option>
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Nombre del cliente"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="Teléfono"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="button"
            disabled={saving}
            onClick={handleCreate}
            className="self-start rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Crear cita'}
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2">
        {loading && <p className="text-gray-400">Cargando...</p>}
        {!loading && appointments.length === 0 && <p className="text-gray-400">No hay citas ese día.</p>}
        {appointments.map((a) => (
          <div
            key={a.id}
            className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
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
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[a.status]}`}>
                {STATUS_LABELS[a.status]}
              </span>
              {a.status !== 'cancelled' && a.status !== 'completed' && (
                <>
                  {a.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(a.id, 'confirmed')}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                    >
                      Confirmar
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(a.id, 'completed')}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => cancelAppointment(a.id)}
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
