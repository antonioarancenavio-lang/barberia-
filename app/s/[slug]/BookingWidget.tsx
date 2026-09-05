'use client';

import { useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSlots, type Slot } from '@/lib/booking';

type Service = { id: string; name: string; description: string | null; price: number; duration_minutes: number };
type Barber = { id: string; name: string; photo_url: string | null };
type BusinessHour = { day_of_week: number; open_time: string | null; close_time: string | null; closed: boolean };

const STEPS = ['servicio', 'barbero', 'fecha', 'datos'] as const;
type Step = (typeof STEPS)[number];

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_LABELS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Calendario mensual propio: navegacion por meses, dias en circulo, estilo Apple Calendar. */
function Calendar({
  value,
  onChange,
  isDayDisabled,
}: {
  value: string;
  onChange: (dateISO: string) => void;
  isDayDisabled: (dateISO: string) => boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const initialMonth = value ? new Date(`${value}T00:00:00`) : today;
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  // Convierte getDay() (0=domingo) a indice con lunes primero (0=lunes).
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  function prevMonth() {
    if (isCurrentMonth) return;
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function nextMonth() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          disabled={isCurrentMonth}
          aria-label="Mes anterior"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] hover:bg-[#f5f5f7] disabled:opacity-20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="text-[15px] font-medium capitalize text-[#1d1d1f]">
          {MONTH_LABELS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Mes siguiente"
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1d1d1f] hover:bg-[#f5f5f7]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="pb-1 text-[12px] font-medium text-[#86868b]">
            {label}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`blank-${i}`} />;
          const iso = toISODate(d);
          const disabled = iso < todayISO || isDayDisabled(iso);
          const isSelected = iso === value;
          const isToday = iso === todayISO;

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={[
                'mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[14px] transition',
                disabled ? 'text-[#d2d2d7]' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]',
                isSelected ? 'bg-[#1d1d1f] text-white hover:bg-[#1d1d1f]' : '',
                isToday && !isSelected ? 'ring-1 ring-inset ring-[#1d1d1f]/30' : '',
              ].join(' ')}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

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

  const [step, setStep] = useState<Step>('servicio');
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
  const stepIndex = STEPS.indexOf(step);

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  function goBack() {
    if (stepIndex === 0) return;
    goTo(STEPS[stepIndex - 1]);
  }

  function selectService(s: Service) {
    setServiceId(s.id);
    setDate('');
    setSlots([]);
    setSelectedSlot(null);
    goTo('barbero');
  }

  function selectBarber(b: Barber) {
    setBarberId(b.id);
    setDate('');
    setSlots([]);
    setSelectedSlot(null);
    goTo('fecha');
  }

  function isDayClosed(dateISO: string) {
    const dayOfWeek = new Date(`${dateISO}T00:00:00`).getDay();
    const hoursForDay = businessHours.find((h) => h.day_of_week === dayOfWeek);
    return !hoursForDay || hoursForDay.closed || !hoursForDay.open_time || !hoursForDay.close_time;
  }

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

  function selectSlot(slot: Slot) {
    setSelectedSlot(slot);
    goTo('datos');
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
      setError('Ese horario se acaba de ocupar. Elige otra hora.');
      setSubmitting(false);
      goTo('fecha');
      return;
    }

    setSubmitting(false);
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <div className="mx-auto max-w-sm rounded-3xl bg-white px-8 py-12 text-center shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f5f7]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="#1d1d1f"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f]">Cita confirmada</h3>
        <p className="mx-auto mt-2 max-w-[240px] text-[15px] leading-snug text-[#86868b]">
          {service?.name} con {barber?.name}
        </p>
        <p className="mt-1 text-[15px] font-medium text-[#1d1d1f]">
          {selectedSlot &&
            new Date(selectedSlot.startISO).toLocaleString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      {/* Barra de progreso */}
      <div className="mb-6 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= stepIndex ? 'bg-[#1d1d1f]' : 'bg-[#e5e5e7]'
            }`}
          />
        ))}
      </div>

      <div className="rounded-3xl bg-white px-6 py-8 shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
        {/* Cabecera: volver + resumen de lo ya elegido */}
        <div className="mb-6 flex min-h-[20px] items-center gap-2">
          {stepIndex > 0 && (
            <button
              onClick={goBack}
              aria-label="Atrás"
              className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-[#1d1d1f] hover:bg-[#f5f5f7]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <p className="truncate text-[13px] text-[#86868b]">
            {[service?.name, barber?.name].filter(Boolean).join(' · ') || 'Reserva tu cita'}
          </p>
        </div>

        {/* Paso: servicio */}
        {step === 'servicio' && (
          <div key="servicio" className="animate-[fadeIn_0.25s_ease]">
            <h2 className="mb-5 text-[22px] font-semibold tracking-tight text-[#1d1d1f]">¿Qué servicio quieres?</h2>
            <div className="flex flex-col gap-2">
              {services.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectService(s)}
                  className="flex items-center justify-between rounded-2xl border border-[#e5e5e7] px-4 py-3.5 text-left transition hover:border-[#1d1d1f]"
                >
                  <span>
                    <span className="block text-[15px] font-medium text-[#1d1d1f]">{s.name}</span>
                    <span className="block text-[13px] text-[#86868b]">{s.duration_minutes} min</span>
                  </span>
                  <span className="text-[15px] font-medium text-[#1d1d1f]">{s.price}€</span>
                </button>
              ))}
              {services.length === 0 && <p className="text-[15px] text-[#86868b]">Aún no hay servicios disponibles.</p>}
            </div>
          </div>
        )}

        {/* Paso: barbero */}
        {step === 'barbero' && (
          <div key="barbero" className="animate-[fadeIn_0.25s_ease]">
            <h2 className="mb-5 text-[22px] font-semibold tracking-tight text-[#1d1d1f]">¿Con quién?</h2>
            <div className="flex flex-col gap-2">
              {barbers.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => selectBarber(b)}
                  className="flex items-center gap-3 rounded-2xl border border-[#e5e5e7] px-4 py-3.5 text-left transition hover:border-[#1d1d1f]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f7] text-[14px] font-medium text-[#1d1d1f]">
                    {b.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-[15px] font-medium text-[#1d1d1f]">{b.name}</span>
                </button>
              ))}
              {barbers.length === 0 && <p className="text-[15px] text-[#86868b]">Aún no hay barberos disponibles.</p>}
            </div>
          </div>
        )}

        {/* Paso: fecha y hora */}
        {step === 'fecha' && (
          <div key="fecha" className="animate-[fadeIn_0.25s_ease]">
            <h2 className="mb-5 text-[22px] font-semibold tracking-tight text-[#1d1d1f]">¿Cuándo?</h2>

            <Calendar value={date} onChange={handleDateChange} isDayDisabled={isDayClosed} />

            {date && (
              <div className="mt-6 border-t border-[#f0f0f0] pt-5">
                {loadingSlots && <p className="text-[14px] text-[#86868b]">Buscando horarios...</p>}
                {!loadingSlots && slots.length === 0 && (
                  <p className="text-[14px] text-[#86868b]">No hay horarios disponibles ese día.</p>
                )}
                {slots.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.startISO}
                        type="button"
                        onClick={() => selectSlot(slot)}
                        className="rounded-xl border border-[#e5e5e7] py-2.5 text-[14px] font-medium text-[#1d1d1f] transition hover:border-[#1d1d1f]"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paso: datos del cliente */}
        {step === 'datos' && (
          <div key="datos" className="animate-[fadeIn_0.25s_ease]">
            <h2 className="mb-1 text-[22px] font-semibold tracking-tight text-[#1d1d1f]">Tus datos</h2>
            {selectedSlot && (
              <p className="mb-5 text-[14px] text-[#86868b]">
                {new Date(selectedSlot.startISO).toLocaleString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
            <div className="flex flex-col gap-3">
              <input
                required
                placeholder="Nombre"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="rounded-2xl border border-[#e5e5e7] px-4 py-3 text-[15px] focus:border-[#1d1d1f] focus:outline-none"
              />
              <input
                required
                placeholder="Teléfono"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="rounded-2xl border border-[#e5e5e7] px-4 py-3 text-[15px] focus:border-[#1d1d1f] focus:outline-none"
              />
              <input
                type="email"
                placeholder="Email (opcional)"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="rounded-2xl border border-[#e5e5e7] px-4 py-3 text-[15px] focus:border-[#1d1d1f] focus:outline-none"
              />
              {error && <p className="text-[14px] text-red-600">{error}</p>}
              <button
                type="button"
                disabled={!clientName || !clientPhone || submitting}
                onClick={handleConfirm}
                className="mt-2 rounded-full bg-[#1d1d1f] py-3.5 text-[15px] font-medium text-white transition hover:bg-black disabled:opacity-30"
              >
                {submitting ? 'Confirmando...' : 'Confirmar cita'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
