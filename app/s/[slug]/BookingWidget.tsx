'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSlots, type Slot } from '@/lib/booking';

type Service = { id: string; name: string; description: string | null; price: number; duration_minutes: number };
type Barber = { id: string; name: string; photo_url: string | null };
type BusinessHour = { day_of_week: number; open_time: string | null; close_time: string | null; closed: boolean };

export function BookingWidget({
  barbershopId,
  services,
  barbers,
  businessHours,
}: {
  barbershopId: string;
  services: Service[];
  barbers: Barber[];
  businessHours: BusinessHour[];
}) {
  const supabase = createClient();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId]);
  const barber = useMemo(() => barbers.find((b) => b.id === barberId) ?? null, [barbers, barberId]);

  const todayISO = new Date().toISOString().slice(0, 10);

  async function handleDateChange(value: string) {
    setDate(value);
    setSelectedSlot(null);
    setSlots([]);
    if (!value || !service || !barber) return;

    setLoadingSlots(true);
    setError(null);

    const dayOfWeek = new Date(`${value}T00:00:00`).getDay();
    const hoursForDay = businessHours.find((h) => h.day_of_week === dayOfWeek);

    if (!hoursForDay || hoursForDay.closed || !hoursForDay.open_time || !hoursForDay.close_time) {
      setSlots([]);
      setLoadingSlots(false);
      return;
    }

    const { data: busyRows, error: busyError } = await supabase.rpc('get_busy_intervals_public', {
      p_barbershop_id: barbershopId,
      p_barber_id: barber.id,
      p_day: value,
    });

    if (busyError) {
      setError('No se pudieron cargar los horarios disponibles.');
      setLoadingSlots(false);
      return;
    }

    const busy = (busyRows ?? []).map((r: any) => ({
      start: new Date(r.start_time),
      end: new Date(r.end_time),
    }));

    const generated = generateSlots({
      dateISO: value,
      openTime: hoursForDay.open_time,
      closeTime: hoursForDay.close_time,
      durationMinutes: service.duration_minutes,
      busy,
    });

    setSlots(generated);
    setLoadingSlots(false);
  }

  async function handleConfirm() {
    if (!service || !barber || !selectedSlot) return;
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from('appointments').insert({
      barbershop_id: barbershopId,
      barber_id: barber.id,
      service_id: service.id,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail || null,
      start_time: selectedSlot.startISO,
      end_time: selectedSlot.endISO,
      status: 'pending',
    });

    if (insertError) {
      // El constraint EXCLUDE de la BD salta aqui si alguien reservo ese hueco
      // justo antes que tu.
      setError('Ese horario se acaba de ocupar. Elige otra hora, por favor.');
      setSubmitting(false);
      setStep(4);
      return;
    }

    setSubmitting(false);
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="text-xl font-semibold text-green-800">¡Cita confirmada!</h3>
        <p className="mt-2 text-green-700">
          {service?.name} con {barber?.name}
          <br />
          {selectedSlot && new Date(selectedSlot.startISO).toLocaleString('es-ES')}
        </p>
        <p className="mt-4 text-sm text-green-600">Te esperamos. Recibirás confirmación por parte de la barbería.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-6">
      {/* Paso 1: servicio */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-gray-500">1. Elige un servicio</p>
        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setServiceId(s.id);
                setStep(2);
                setDate('');
                setSlots([]);
                setSelectedSlot(null);
              }}
              className={`rounded-lg border px-4 py-2 text-left ${
                serviceId === s.id ? 'border-brand bg-gray-50' : 'border-gray-200'
              }`}
            >
              <span className="font-medium">{s.name}</span>
              <span className="ml-2 text-sm text-gray-500">
                {s.price}€ · {s.duration_minutes} min
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Paso 2: barbero */}
      {service && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-500">2. Elige un barbero</p>
          <div className="flex flex-wrap gap-2">
            {barbers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setBarberId(b.id);
                  setStep(3);
                  setDate('');
                  setSlots([]);
                  setSelectedSlot(null);
                }}
                className={`rounded-lg border px-4 py-2 ${
                  barberId === b.id ? 'border-brand bg-gray-50' : 'border-gray-200'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 3: fecha */}
      {service && barber && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-500">3. Elige una fecha</p>
          <input
            type="date"
            min={todayISO}
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
        </div>
      )}

      {/* Paso 4: hora */}
      {date && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium text-gray-500">4. Elige una hora</p>
          {loadingSlots && <p className="text-sm text-gray-400">Cargando horarios...</p>}
          {!loadingSlots && slots.length === 0 && (
            <p className="text-sm text-gray-400">No hay horarios disponibles ese día.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot.startISO}
                type="button"
                onClick={() => {
                  setSelectedSlot(slot);
                  setStep(5);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  selectedSlot?.startISO === slot.startISO ? 'border-brand bg-gray-50' : 'border-gray-200'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Paso 5: datos del cliente */}
      {selectedSlot && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-500">5. Tus datos</p>
          <input
            required
            placeholder="Nombre"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            required
            placeholder="Teléfono"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            disabled={!clientName || !clientPhone || submitting}
            onClick={handleConfirm}
            className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-light disabled:opacity-50"
          >
            {submitting ? 'Confirmando...' : 'Confirmar cita'}
          </button>
        </div>
      )}
    </div>
  );
}
