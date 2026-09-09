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
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DAYS_AHEAD = 21;
const ANY_BARBER = 'any';

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

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ---------------------------------------------------------------
   Tira de fechas para movil
   --------------------------------------------------------------- */
function DateStripMobile(props: { value: string; onChange: (d: string) => void; isDayDisabled: (d: string) => boolean }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const days: Date[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    refs.current[props.value]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
              refs.current[iso] = el;
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

/* ---------------------------------------------------------------
   Calendario de mes para escritorio
   --------------------------------------------------------------- */
function MonthCalendarDesktop(props: { value: string; onChange: (d: string) => void; isDayDisabled: (d: string) => boolean }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const initial = props.value ? new Date(props.value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(new Date(viewYear, viewMonth, i));

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
    <div className="cal-wrapper">
      <div className="cal-header">
        <button type="button" onClick={prevMonth} disabled={isCurrentMonth} className="cal-nav" aria-label="Mes anterior">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="cal-title">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button type="button" onClick={nextMonth} className="cal-nav" aria-label="Mes siguiente">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="cal-grid">
        {WEEKDAY_SHORT.slice(1).concat(WEEKDAY_SHORT[0]).map((label) => (
          <span key={label} className="cal-weekday">{label}</span>
        ))}
        {cells.map((d, i) => {
          if (!d) return <span key={'b' + i} />;
          const iso = toISODate(d);
          const disabled = iso < todayISO || props.isDayDisabled(iso);
          const isSelected = iso === props.value;
          const isToday = iso === todayISO;
          let cls = 'cal-day';
          if (disabled) cls += ' cal-day-disabled';
          else if (isSelected) cls += ' cal-day-selected';
          else if (isToday) cls += ' cal-day-today';

          return (
            <button key={iso} type="button" disabled={disabled} onClick={() => props.onChange(iso)} className={cls}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
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
  return [
    { label: 'Manana', slots: morning },
    { label: 'Tarde', slots: afternoon },
    { label: 'Noche', slots: evening },
  ].filter((g) => g.slots.length > 0);
}

function buildICS(opts: { title: string; startISO: string; endISO: string; location: string }) {
  const dt = (iso: string) => iso.replace(/[-:]/g, '').split('.')[0] + 'Z';
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    'SUMMARY:' + opts.title,
    'DTSTART:' + dt(opts.startISO),
    'DTEND:' + dt(opts.endISO),
    'LOCATION:' + opts.location,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}

export function BookingWidget(props: {
  barbershopId: string;
  services: Service[];
  barbers: Barber[];
  businessHours: BusinessHour[];
  accentColor?: string;
  shopName?: string;
  shopAddress?: string;
  shopCity?: string;
  shopPhone?: string;
}) {
  const { barbershopId, services, barbers, businessHours, accentColor, shopName, shopAddress, shopCity, shopPhone } = props;
  const accentStyle = { '--shop-accent': accentColor || '#17171A' } as React.CSSProperties;
  const supabase = createClient();

  const [step, setStep] = useState<Step>('servicio');
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null); // id real, o 'any'
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotBarberMap, setSlotBarberMap] = useState<Record<string, string[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [assignedBarber, setAssignedBarber] = useState<Barber | null>(null);

  const service = useMemo(() => services.find((s) => s.id === serviceId) || null, [services, serviceId]);
  const chosenBarber = useMemo(() => {
    if (!barberId || barberId === ANY_BARBER) return null;
    return barbers.find((b) => b.id === barberId) || null;
  }, [barbers, barberId]);
  const barberLabel = barberId === ANY_BARBER ? 'Cualquiera disponible' : chosenBarber?.name || '';

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

  function selectBarberOption(id: string) {
    setBarberId(id);
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
    setSlotBarberMap({});
    if (!value || !service || !barberId) return;

    setLoadingSlots(true);
    setError(null);

    const dayOfWeek = new Date(value + 'T00:00:00').getDay();
    const hoursForDay = businessHours.find((h) => h.day_of_week === dayOfWeek);

    if (!hoursForDay || hoursForDay.closed || !hoursForDay.open_time || !hoursForDay.close_time) {
      setSlots([]);
      setLoadingSlots(false);
      return;
    }

    if (barberId !== ANY_BARBER) {
      const busyResult = await supabase.rpc('get_busy_intervals_public', {
        p_barbershop_id: barbershopId,
        p_barber_id: barberId,
        p_day: value,
      });

      if (busyResult.error) {
        setError('No se pudieron cargar los horarios disponibles.');
        setLoadingSlots(false);
        return;
      }

      const busy = (busyResult.data || []).map((r: any) => ({ start: new Date(r.start_time), end: new Date(r.end_time) }));
      const generated = generateSlots({
        dateISO: value,
        openTime: hoursForDay.open_time,
        closeTime: hoursForDay.close_time,
        durationMinutes: service.duration_minutes,
        busy,
      });
      setSlots(generated);
      const map: Record<string, string[]> = {};
      generated.forEach((s) => (map[s.startISO] = [barberId]));
      setSlotBarberMap(map);
      setLoadingSlots(false);
      return;
    }

    // Cualquiera disponible: consultamos ocupacion de toda la barberia y unimos huecos.
    const busyResult = await supabase.rpc('get_busy_intervals_for_shop_public', {
      p_barbershop_id: barbershopId,
      p_day: value,
    });

    if (busyResult.error) {
      setError('No se pudieron cargar los horarios disponibles.');
      setLoadingSlots(false);
      return;
    }

    const rows = busyResult.data || [];
    const globalBusy = rows
      .filter((r: any) => !r.barber_id)
      .map((r: any) => ({ start: new Date(r.start_time), end: new Date(r.end_time) }));

    const byBarber: Record<string, { start: Date; end: Date }[]> = {};
    barbers.forEach((b) => {
      byBarber[b.id] = [...globalBusy];
    });
    rows.forEach((r: any) => {
      if (r.barber_id && byBarber[r.barber_id]) {
        byBarber[r.barber_id].push({ start: new Date(r.start_time), end: new Date(r.end_time) });
      }
    });

    const slotMap = new Map<string, { slot: Slot; barberIds: string[] }>();
    barbers.forEach((b) => {
      const generated = generateSlots({
        dateISO: value,
        openTime: hoursForDay.open_time!,
        closeTime: hoursForDay.close_time!,
        durationMinutes: service.duration_minutes,
        busy: byBarber[b.id] || [],
      });
      generated.forEach((s) => {
        const existing = slotMap.get(s.startISO);
        if (existing) existing.barberIds.push(b.id);
        else slotMap.set(s.startISO, { slot: s, barberIds: [b.id] });
      });
    });

    const merged = Array.from(slotMap.values()).sort((a, b) => a.slot.startISO.localeCompare(b.slot.startISO));
    setSlots(merged.map((m) => m.slot));
    const map: Record<string, string[]> = {};
    merged.forEach((m) => (map[m.slot.startISO] = m.barberIds));
    setSlotBarberMap(map);
    setLoadingSlots(false);
  }

  function selectSlot(slot: Slot) {
    setSelectedSlot(slot);
    goTo('datos');
  }

  async function handleConfirm() {
    if (!service || !barberId || !selectedSlot) return;

    const candidates = slotBarberMap[selectedSlot.startISO] || (barberId !== ANY_BARBER ? [barberId] : []);
    const finalBarberId = candidates[0];
    const finalBarber = barbers.find((b) => b.id === finalBarberId) || null;

    if (!finalBarberId) {
      setError('Ese horario ya no esta disponible. Elige otro.');
      goTo('fecha');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await supabase.from('appointments').insert({
      barbershop_id: barbershopId,
      barber_id: finalBarberId,
      service_id: service.id,
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail || null,
      start_time: selectedSlot.startISO,
      end_time: selectedSlot.endISO,
      status: 'pending',
    });

    if (result.error) {
      if (result.error.message.includes('plan_limit_appointments')) {
        setError('Esta barbería ha alcanzado su límite de citas este mes. Prueba a contactar directamente.');
      } else {
        setError('Ese horario se acaba de ocupar. Elige otra hora.');
      }
      setSubmitting(false);
      goTo('fecha');
      return;
    }

    setAssignedBarber(finalBarber);
    setSubmitting(false);
    setConfirmed(true);
  }

  function downloadICS() {
    if (!service || !selectedSlot) return;
    const ics = buildICS({
      title: service.name + ' - ' + (shopName || ''),
      startISO: selectedSlot.startISO,
      endISO: selectedSlot.endISO,
      location: [shopAddress, shopCity].filter(Boolean).join(', '),
    });
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cita.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  const mapsHref =
    shopAddress || shopCity
      ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([shopAddress, shopCity].filter(Boolean).join(', '))
      : null;
  const telHref = shopPhone ? 'tel:' + shopPhone.replace(/\s+/g, '') : null;

  /* -------------------- Pantalla de confirmacion -------------------- */
  if (confirmed) {
    return (
      <div className="booking-wrapper" style={accentStyle}>
        <div className="booking-card booking-confirmed">
          <div className="confirmed-check">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#17171A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="confirmed-title">Cita confirmada</h3>
          <p className="confirmed-sub">
            {service ? service.name : ''} con {assignedBarber ? assignedBarber.name : barberLabel}
          </p>
          <p className="confirmed-date">{selectedSlot ? formatSlot(selectedSlot.startISO) : ''}</p>
          <p className="confirmed-price">{service ? service.price + '€' : ''}</p>

          <div className="confirmed-actions">
            <button type="button" onClick={downloadICS} className="btn-secondary">Añadir al calendario</button>
            {mapsHref && (
              <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="btn-secondary">Ver ubicación</a>
            )}
            {telHref && (
              <a href={telHref} className="btn-secondary">Contactar</a>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* -------------------- Flujo de reserva -------------------- */
  return (
    <div className="booking-layout" style={accentStyle}>
      <div className="booking-main">
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
              {service && barberLabel ? ' - ' : ''}
              {barberLabel}
              {!service && !barberLabel ? 'Reserva tu cita' : ''}
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
                <button type="button" onClick={() => selectBarberOption(ANY_BARBER)} className="option-card option-card-recommended">
                  <span className="avatar-circle">?</span>
                  <span className="option-main">
                    <span className="option-name">Cualquiera disponible</span>
                    <span className="option-meta">Más horas para elegir</span>
                  </span>
                </button>
                {barbers.map((b) => (
                  <button key={b.id} type="button" onClick={() => selectBarberOption(b.id)} className="option-card">
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

              <div className="cal-desktop-only">
                <MonthCalendarDesktop value={date} onChange={handleDateChange} isDayDisabled={isDayClosed} />
              </div>
              <div className="cal-mobile-only">
                <DateStripMobile value={date} onChange={handleDateChange} isDayDisabled={isDayClosed} />
              </div>

              {date && (
                <div className="slots-section">
                  <p className="selected-date-label">{formatShortDate(date + 'T00:00:00')}</p>
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
                <input required placeholder="Nombre" value={clientName} onChange={(e) => setClientName(e.target.value)} className="text-input" />
                <input required placeholder="Telefono" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="text-input" />
              </div>
              <input type="email" placeholder="Email (opcional)" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="text-input full-width" />
              {error && <p className="error-text">{error}</p>}
              <button type="button" disabled={!clientName || !clientPhone || submitting} onClick={handleConfirm} className="confirm-button">
                {submitting ? 'Confirmando...' : 'Confirmar cita'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resumen fijo en escritorio */}
      <aside className="booking-sidebar">
        <div className="summary-card">
          <p className="summary-eyebrow">Tu reserva</p>
          {!service && <p className="empty-text">Elige un servicio para empezar.</p>}
          {service && (
            <>
              <p className="summary-service">{service.name}</p>
              {barberLabel && <p className="summary-line">{barberLabel}</p>}
              {selectedSlot && <p className="summary-line">{formatSlot(selectedSlot.startISO)}</p>}
              <div className="summary-total">
                <span>{service.duration_minutes} min</span>
                <span className="summary-price">{service.price}€</span>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Barra de resumen fija en movil */}
      {service && (
        <div className="mobile-summary-bar">
          <span className="mobile-summary-text">
            {service.name}
            {barberLabel ? ' · ' + barberLabel : ''}
            {selectedSlot ? ' · ' + formatShortDate(selectedSlot.startISO) : ''}
          </span>
          <span className="mobile-summary-price">{service.price}€</span>
        </div>
      )}
    </div>
  );
}
