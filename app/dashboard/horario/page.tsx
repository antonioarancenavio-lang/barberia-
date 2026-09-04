'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

type DayRow = { day_of_week: number; open_time: string; close_time: string; closed: boolean };
type BlockedTime = { id: string; start_time: string; end_time: string; reason: string | null };

export default function HorarioPage() {
  const supabase = createClient();
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [days, setDays] = useState<DayRow[]>(
    Array.from({ length: 7 }, (_, i) => ({ day_of_week: i, open_time: '09:00', close_time: '20:00', closed: i === 0 }))
  );
  const [blocks, setBlocks] = useState<BlockedTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('');

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).maybeSingle();
    if (!shop) return;
    setBarbershopId(shop.id);

    const { data: hours } = await supabase
      .from('business_hours')
      .select('day_of_week, open_time, close_time, closed')
      .eq('barbershop_id', shop.id);

    if (hours && hours.length > 0) {
      setDays(
        Array.from({ length: 7 }, (_, i) => {
          const existing = hours.find((h: any) => h.day_of_week === i);
          return {
            day_of_week: i,
            open_time: existing?.open_time?.slice(0, 5) ?? '09:00',
            close_time: existing?.close_time?.slice(0, 5) ?? '20:00',
            closed: existing ? existing.closed : i === 0,
          };
        })
      );
    }

    const { data: blockedTimes } = await supabase
      .from('blocked_times')
      .select('id, start_time, end_time, reason')
      .eq('barbershop_id', shop.id)
      .order('start_time');
    setBlocks(blockedTimes ?? []);

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDay(index: number, patch: Partial<DayRow>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
    setSaved(false);
  }

  async function saveHours() {
    setSaving(true);
    await supabase.from('business_hours').delete().eq('barbershop_id', barbershopId);
    await supabase.from('business_hours').insert(
      days.map((d) => ({
        barbershop_id: barbershopId,
        day_of_week: d.day_of_week,
        open_time: d.closed ? null : d.open_time,
        close_time: d.closed ? null : d.close_time,
        closed: d.closed,
      }))
    );
    setSaving(false);
    setSaved(true);
  }

  async function addBlock() {
    if (!blockStart || !blockEnd) return;
    await supabase.from('blocked_times').insert({
      barbershop_id: barbershopId,
      start_time: new Date(blockStart).toISOString(),
      end_time: new Date(blockEnd).toISOString(),
      reason: blockReason || null,
    });
    setBlockStart('');
    setBlockEnd('');
    setBlockReason('');
    load();
  }

  async function removeBlock(id: string) {
    await supabase.from('blocked_times').delete().eq('id', id);
    load();
  }

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Horario</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-500">Horario semanal</p>
        <div className="flex flex-col gap-2">
          {days.map((d, i) => (
            <div key={d.day_of_week} className="grid grid-cols-4 items-center gap-2 text-sm">
              <span>{DAY_NAMES[d.day_of_week]}</span>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={d.closed}
                  onChange={(e) => updateDay(i, { closed: e.target.checked })}
                />
                Cerrado
              </label>
              <input
                type="time"
                disabled={d.closed}
                value={d.open_time}
                onChange={(e) => updateDay(i, { open_time: e.target.value })}
                className="rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-40"
              />
              <input
                type="time"
                disabled={d.closed}
                value={d.close_time}
                onChange={(e) => updateDay(i, { close_time: e.target.value })}
                className="rounded-lg border border-gray-300 px-2 py-1 disabled:opacity-40"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={saveHours}
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar horario'}
        </button>
        {saved && <span className="ml-3 text-sm text-green-600">Guardado ✓</span>}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-500">Bloquear un periodo (vacaciones, festivos...)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <input
            type="datetime-local"
            value={blockStart}
            onChange={(e) => setBlockStart(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="datetime-local"
            value={blockEnd}
            onChange={(e) => setBlockEnd(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Motivo (opcional)"
            value={blockReason}
            onChange={(e) => setBlockReason(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={addBlock}
          className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Bloquear
        </button>

        <div className="mt-4 flex flex-col gap-2">
          {blocks.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span>
                {new Date(b.start_time).toLocaleString('es-ES')} → {new Date(b.end_time).toLocaleString('es-ES')}
                {b.reason && ` · ${b.reason}`}
              </span>
              <button onClick={() => removeBlock(b.id)} className="text-red-600 hover:underline">
                Quitar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
