'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Barber = { id: string; name: string; photo_url: string | null; active: boolean };

export default function BarberosPage() {
  const supabase = createClient();
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).maybeSingle();
    if (!shop) return;
    setBarbershopId(shop.id);

    const { data } = await supabase
      .from('barbers')
      .select('id, name, photo_url, active')
      .eq('barbershop_id', shop.id)
      .order('name');
    setBarbers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    setError(null);
    if (!name) {
      setError('Escribe un nombre.');
      return;
    }
    setSaving(true);
    const { error: insertError } = await supabase.from('barbers').insert({
      barbershop_id: barbershopId,
      name,
    });
    setSaving(false);
    if (insertError) {
      setError('No se pudo añadir el barbero.');
      return;
    }
    setName('');
    load();
  }

  async function toggleActive(barber: Barber) {
    await supabase.from('barbers').update({ active: !barber.active }).eq('id', barber.id);
    load();
  }

  async function remove(barber: Barber) {
    if (!confirm(`¿Eliminar a "${barber.name}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from('barbers').delete().eq('id', barber.id);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Barberos</h1>

      <div className="mt-6 flex gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <input
          placeholder="Nombre del barbero"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={saving}
          onClick={handleAdd}
          className="rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Añadir'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-col gap-2">
        {loading && <p className="text-gray-400">Cargando...</p>}
        {!loading && barbers.length === 0 && <p className="text-gray-400">No tienes barberos todavía.</p>}
        {barbers.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <p className="font-medium">
              {b.name} {!b.active && <span className="text-xs text-gray-400">(oculto)</span>}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(b)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
              >
                {b.active ? 'Ocultar' : 'Mostrar'}
              </button>
              <button
                onClick={() => remove(b)}
                className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
