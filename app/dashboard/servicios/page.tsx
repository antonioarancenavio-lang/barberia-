'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  active: boolean;
};

export default function ServiciosPage() {
  const supabase = createClient();
  const [barbershopId, setBarbershopId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
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
      .from('services')
      .select('id, name, description, price, duration_minutes, active')
      .eq('barbershop_id', shop.id)
      .order('name');
    setServices(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd() {
    setError(null);
    if (!name || !price) {
      setError('Nombre y precio son obligatorios.');
      return;
    }
    setSaving(true);
    const { error: insertError } = await supabase.from('services').insert({
      barbershop_id: barbershopId,
      name,
      description: description || null,
      price: Number(price),
      duration_minutes: Number(duration),
    });
    setSaving(false);
    if (insertError) {
      setError('No se pudo crear el servicio.');
      return;
    }
    setName('');
    setDescription('');
    setPrice('');
    setDuration('30');
    load();
  }

  async function toggleActive(service: Service) {
    await supabase.from('services').update({ active: !service.active }).eq('id', service.id);
    load();
  }

  async function remove(service: Service) {
    if (!confirm(`¿Eliminar "${service.name}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from('services').delete().eq('id', service.id);
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Servicios</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-gray-500">Añadir servicio</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="Nombre (ej. Corte de pelo)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-1"
          />
          <input
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm sm:col-span-1"
          />
          <input
            type="number"
            min="0"
            step="0.5"
            placeholder="Precio (€)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min="5"
            step="5"
            placeholder="Duración (min)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="button"
          disabled={saving}
          onClick={handleAdd}
          className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Añadir servicio'}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {loading && <p className="text-gray-400">Cargando...</p>}
        {!loading && services.length === 0 && <p className="text-gray-400">No tienes servicios todavía.</p>}
        {services.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {s.name} {!s.active && <span className="text-xs text-gray-400">(oculto)</span>}
              </p>
              <p className="text-sm text-gray-500">
                {s.price}€ · {s.duration_minutes} min
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleActive(s)}
                className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
              >
                {s.active ? 'Ocultar' : 'Mostrar'}
              </button>
              <button
                onClick={() => remove(s)}
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
