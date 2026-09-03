export interface BusyInterval {
  start: Date;
  end: Date;
}

export interface Slot {
  startISO: string;
  endISO: string;
  label: string;
}

/**
 * Genera los huecos de tiempo disponibles para un dia concreto, dado el
 * horario de apertura/cierre de la barberia, la duracion del servicio y los
 * intervalos ya ocupados (citas existentes + bloqueos manuales).
 *
 * Simplificacion de la Fase 3: trabaja con la hora local del navegador,
 * sin gestion de zonas horarias distintas entre cliente y barberia.
 */
export function generateSlots({
  dateISO,
  openTime,
  closeTime,
  durationMinutes,
  busy,
  stepMinutes = 30,
}: {
  dateISO: string; // 'YYYY-MM-DD'
  openTime: string; // 'HH:MM:SS' o 'HH:MM'
  closeTime: string;
  durationMinutes: number;
  busy: BusyInterval[];
  stepMinutes?: number;
}): Slot[] {
  const [oh, om] = openTime.split(':').map(Number);
  const [ch, cm] = closeTime.split(':').map(Number);

  const cursorStart = new Date(`${dateISO}T00:00:00`);
  cursorStart.setHours(oh, om, 0, 0);

  const closeAt = new Date(`${dateISO}T00:00:00`);
  closeAt.setHours(ch, cm, 0, 0);

  const now = new Date();
  const slots: Slot[] = [];
  let cursor = cursorStart;

  while (true) {
    const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);
    if (slotEnd > closeAt) break;

    const overlaps = busy.some((b) => cursor < b.end && slotEnd > b.start);
    const isPast = cursor < now;

    if (!overlaps && !isPast) {
      slots.push({
        startISO: cursor.toISOString(),
        endISO: slotEnd.toISOString(),
        label: cursor.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    cursor = new Date(cursor.getTime() + stepMinutes * 60000);
  }

  return slots;
}
