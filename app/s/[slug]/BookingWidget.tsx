'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateSlots, type Slot } from '@/lib/booking';

type Service = { id: string; name: string; description: string | null; price: number; duration_minutes: number };
type Barber = { id: string; name: string; photo_url: string | null };
type BusinessHour = { day_of_week: number; open_time: string | null; close_time: string | null; closed: boolean };

const STEPS = ['servicio', 'barbero', 'fecha', 'datos'] as const;
type Step = (typeof STEPS)[number];

const WEEKDAY_SHORT = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
const DAYS_AHEAD = 21;

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function formatSlot(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function DateStrip(props: {
  value: string;
  onChange: (dateISO: string) => void;
  isDayDisabled: (dateISO: string) => boolean;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const days: Date[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = buttonRefs.current[props.value];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [props.value]);

  return (
    <div className="date-strip">
      {days.map((d) => {
        const iso = toISODate(d);
        const disabled = props.isDayDisabled(iso);
        const isSelected = iso === props.value;
        const isToday = iso === todayISO;

        let stateClass = 'date-pill-normal';
        if (disabled) stateClass = 'date-pill-disabled';
        else if (isSelected) stateClass = 'date-pill-selected';

        return (
          <button
            key={iso}
            ref={(el) => {
              buttonRefs.current[iso] = el;
            }}
            type="button"
            disabled={disabled}
            onClick={() => props.onChange(iso)}
            className={'date-pill ' + stateClass}
          >
            <span className="date-pill-weekday">{WEEKDAY_SHORT[d.getDay()]}</span>
            <span className="date-pill-day">{d.getDate()}</span>
            {isToday && !isSelected && <span className="date-pill-dot" />}
          </button>
        );
      })}
    </div>
  );
}

function groupSlots(slots: Slot[]) {
  const morning: Slot[] = [];
  const afternoon: Slot[] = [];
  const evening: Slot[] = [];

  slots.forEach((slot) => {
    const hour = new Date(slot.startISO).getHours();
    if (hour < 14) morning.push(slot);
    else if (hour < 19) afternoon.push(slot);
    else evening.push(slot);
  });

  const groups = [
    { label: 'Manana', slots: morning },
    { label: 'Tarde', slots: afternoon },
    { label: 'Noche', slots: evening },
  ];

  return groups.filter((g) => g.slots.length > 0);
}

export function BookingWidget(props: {
  barbershopId: string;
  services: Service[];
  barbers: Barber[];
  businessHours: BusinessHour[];
  accentColor?: string;
}) {
  const { barbershopId, services, barbers, businessHours, accentColor } = props;
  const accentStyle = { '--shop-accent': accentColor || '#17171A' } as React.CSSProperties;
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

  const service = useMemo(() => {
    return services.find((s) => s.id === serviceId) || null;
  }, [services, serviceId]);

  const barber = useMemo(() => {
    return barbers.find((b) => b.id === barberId) || null;
  }, [barbers, barberId]);

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
    const dayOfWeek = new Date(dateISO + 'T00:00:00').getDay();
    const hoursForDay = businessHours.find((h) => h.day_of_week === dayOfWeek);
    if (!hoursForDay) return true;
    if (hoursForDay.closed) return true;
    if (!hoursForDay.open_time || !hoursForDay.close_time) return true;
    return false;
  }

  async function handleDateChange(value: string) {
    setDate(value);
    setSelectedSlot(null);
    setSlots([]);
    if (!value || !service || !barber) return;

    setLoadingSlots(true);
    setError(null);

    const dayOfWeek = new Date(value + 'T00:00:00').getDay();
    const hoursForDay = businessHours.find((h) => h.day_of_week === dayOfWeek);

    if (!hoursForDay || hoursForDay.closed || !hoursForDay.open_time || !hoursForDay.close_time) {
      setSlots([]);
      setLoadingSlots(false);
      return;
    }

    const busyResult = await supabase.rpc('get_busy_intervals_public', {
      p_barbershop_id: barbershopId,
      p_barber_id: barber.id,
      p_day: value,
    });

    if (busyResult.error) {
      setError('No se pudieron cargar los horarios disponibles.');
      setLoadingSlots(false);
      return;
    }

    const busyRows = busyResult.data || [];
    const busy = busyRows.map((r: any) => ({
      start: new Date(r.start_time),
      end: new Date(r.end_time),
    }));

    const generated = generateSlots({
      dateISO: value,
      openTime: hoursForDay.open_time,
      closeTime: hoursForDay.close_time,
      durationMinutes: service.duration_minutes,
      busy: busy,
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

    const result = await supabase.from('appointments').insert({
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

    if (result.error) {
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
      <div className="booking-card booking-confirmed" style={accentStyle}>
        <div className="confirmed-check">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#1d1d1f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="confirmed-title">Cita confirmada</h3>
        <p className="confirmed-sub">
          {service ? service.name : ''} con {barber ? barber.name : ''}
        </p>
        <p className="confirmed-date">{selectedSlot ? formatSlot(selectedSlot.startISO) : ''}</p>
      </div>
    );
  }

  return (
    <div className="booking-wrapper" style={accentStyle}>
      <div className="progress-track">
        {STEPS.map((s, i) => (
          <div key={s} className={i <= stepIndex ? 'progress-bar progress-bar-filled' : 'progress-bar'} />
        ))}
      </div>

      <div className="booking-card">
        <div className="booking-header">
          {stepIndex > 0 && (
            <button onClick={goBack} aria-label="Atras" className="back-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <p className="booking-summary-line">
            {service ? service.name : ''}
            {service && barber ? ' - ' : ''}
            {barber ? barber.name : ''}
            {!service && !barber ? 'Reserva tu cita' : ''}
          </p>
          {service && <span className="price-chip">{service.price}€ · {service.duration_minutes} min</span>}
        </div>

        {step === 'servicio' && (
          <div>
            <h2 className="step-title">Que servicio quieres?</h2>
            <div className="option-grid">
              {services.map((s) => (
                <button key={s.id} type="button" onClick={() => selectService(s)} className="option-card">
                  <span className="option-left">
                    <span className="service-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.6" />
                        <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.6" />
                        <path d="M8.5 8.5L19 19M19 5L8.5 15.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="option-main">
                      <span className="option-name">{s.name}</span>
                      <span className="option-meta">{s.duration_minutes} min</span>
                    </span>
                  </span>
                  <span className="option-price">{s.price}€</span>
                </button>
              ))}
              {services.length === 0 && <p className="empty-text">Aun no hay servicios disponibles.</p>}
            </div>
          </div>
        )}

        {step === 'barbero' && (
          <div>
            <h2 className="step-title">Con quien?</h2>
            <div className="option-grid">
              {barbers.map((b) => (
                <button key={b.id} type="button" onClick={() => selectBarber(b)} className="option-card">
                  {b.photo_url ? (
                    <img src={b.photo_url} alt={b.name} className="avatar-photo" />
                  ) : (
                    <span className="avatar-circle">{b.name.charAt(0).toUpperCase()}</span>
                  )}
                  <span className="option-name">{b.name}</span>
                </button>
              ))}
              {barbers.length === 0 && <p className="empty-text">Aun no hay barberos disponibles.</p>}
            </div>
          </div>
        )}

        {step === 'fecha' && (
          <div>
            <h2 className="step-title">Cuando?</h2>
            <DateStrip value={date} onChange={handleDateChange} isDayDisabled={isDayClosed} />

            {date && (
              <div className="slots-section">
                {loadingSlots && <p className="empty-text">Buscando horarios...</p>}
                {!loadingSlots && slots.length === 0 && <p className="empty-text">No hay horarios disponibles ese dia.</p>}
                {slotGroups.map((group) => (
                  <div key={group.label} className="slot-group">
                    <p className="slot-group-label">{group.label}</p>
                    <div className="slot-grid">
                      {group.slots.map((slot) => (
                        <button key={slot.startISO} type="button" onClick={() => selectSlot(slot)} className="slot-button">
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'datos' && (
          <div>
            <h2 className="step-title">Tus datos</h2>
            {selectedSlot && <p className="selected-slot-line">{formatSlot(selectedSlot.startISO)}</p>}
            <div className="form-grid">
              <input
                required
                placeholder="Nombre"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="text-input"
              />
              <input
                required
                placeholder="Telefono"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="text-input"
              />
            </div>
            <input
              type="email"
              placeholder="Email (opcional)"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="text-input full-width"
            />
            {error && <p className="error-text">{error}</p>}
            <button
              type="button"
              disabled={!clientName || !clientPhone || submitting}
              onClick={handleConfirm}
              className="confirm-button"
            >
              {submitting ? 'Confirmando...' : 'Confirmar cita'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
