'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSlots, type Slot } from '@/lib/booking';

type Service = { id: string; name: string; description: string | null; price: number; duration_minutes: number };
type Barber = { id: string; name: string; photo_url: string | null };
type BusinessHour = { day_of_week: number; open_time: string | null; close_time: string | null; closed: boolean };

const STEPS = ['servicio', 'barbero', 'fecha', 'datos'] as const;
type Step = (typeof STEPS)[number];

const WEEKDAY_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DAYS_AHEAD = 21;

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Tira horizontal de fechas con scroll-snap, presion tactil y auto-centrado
 * de la fecha seleccionada: la interaccion "con vida" que se pedia.
 */
function DateStrip({
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

  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (value && buttonRefs.current[value]) {
      buttonRefs.current[value]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [value]);

  return (
    <div
      className="-mx-6 flex snap-x snap-proximity gap-2.5 overflow-x-auto scroll-smooth px-6 pb-2"
      style={{ scrollbarWidth: 'none' }}
    >
      {days.map((d) => {
        const iso = toISODate(d);
        const disabled = isDayDisabled(iso);
        const isSelected = iso === value;
        const isToday = iso === todayISO;

        return (
          <button
            key={iso}
            ref={(el) => {
              buttonRefs.current[iso] = el;
            }}
            type="button"
            disabled={disabled}
            onClick={() => onChange(iso)}
            className={[
              'flex w-16 shrink-0 snap-center flex-col items-center gap-1 rounded-2xl border py-2.5',
              'transition-all duration-200 ease-out active:scale-90',
              disabled
                ? 'border-[#f0f0f0] text-[#d2d2d7]'
                : isSelected
                ? 'scale-[1.06] border-[#1d1d1f] bg-[#1d1d1f] text-white shadow-[0_6px_16px_rgba(0,0,0,0.18)]'
                : 'border-[#e5e5e7] text-[#1d1d1f] hover:scale-[1.03] hover:border-[#1d1d1f]',
            ].join(' ')}
          >
            <span className={`text-[11px] uppercase ${isSelected ? 'text-white/70' : 'text-[#86868b]'}`}>
              {WEEKDAY_SHORT[d.getDay()]}
            </span>
            <span className="text-[16px] font-semibold">{d.getDate()}</span>
            {isToday && !isSelected && <span className="h-1 w-1 rounded-full bg-[#1d1d1f]" />}
          </button>
        );
      })}
    </div>
  );
}

/** Agrupa los huecos disponibles en Mañana / Tarde / Noche, como Booksy. */
function groupSlots(slots: Slot[]) {
  const groups: { label: string; slots: Slot[] }[] = [
    { label: 'Mañana', slots: [] },
    { label: 'Tarde', slots: [] },
    { label: 'Noche', slots: [] },
  ];
  for (const slot of slots) {
    const hour = new Date(slot.startISO).getHours();
    if (hour < 14) groups[0].slots.push(slot);
    else if (hour < 19) groups[1].slots.push(slot);
    else groups[2].slots.push(slot);
  }
  return groups.filter((g) => g.slots.length > 0);
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
  const slotGroups = useMemo(() => groupSlots(slots), [slots]);

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
      <div className="mx-auto max-w-md rounded-3xl bg-white px-8 py-12 text-center shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
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
    <div className="mx-auto max-w-md">
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

      <div className="rounded-3xl bg-white px-7 py-10 sm:px-9 sm:py-12 shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
        {/* Cabecera: volver + resumen de lo ya elegido */}
        <div className="mb-6 flex min-h-[20px] items-center gap-2">
          {stepIndex > 0 && (
            <button
              onClick={goBack}
              aria-label="Atrás"
              className="-ml-1 flex h-7 w-7 items-center justify-center rounded-full text-[#1d1d1f] transition active:scale-90 hover:bg-[#f5f5f7]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <p className="flex-1 truncate text-[13px] text-[#86868b]">
            {[service?.name, barber?.name].filter(Boolean).join(' · ') || 'Reserva tu cita'}
          </p>
          {service && (
            <span className="shrink-0 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f]">
              {service.price}€ · {service.duration_minutes} min
            </span>
          )}
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
                  className="flex items-center justify-between rounded-2xl border border-[#e5e5e7] px-4 py-3.5 text-left transition-all duration-150 active:scale-[0.98] hover:border-[#1d1d1f]"
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
