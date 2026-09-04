'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Barbershop = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  status: string;
  plan: string;
  created_at: string;
  appointments: { count: number }[];
};

const PLAN_LABELS: Record<string, string> = { free: 'Free', pro: 'Pro', premium: 'Premium' };

export function AdminClient({
  initialBarbershops,
  totalUsers,
  totalAppointments,
}: {
  initialBarbershops: Barbershop[];
  totalUsers: number;
  totalAppointments: number;
}) {
  const supabase = createClient();
  const [barbershops, setBarbershops] = useState(initialBarbershops);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return barbershops;
    return barbershops.filter(
      (b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q) || (b.city ?? '').toLowerCase().includes(q)
    );
  }, [barbershops, search]);

  async function toggleStatus(shop: Barbershop) {
    const newStatus = shop.status === 'active' ? 'suspended' : 'active';
    await supabase.from('barbershops').update({ status: newStatus }).eq('id', shop.id);
    setBarbershops((prev) => prev.map((b) => (b.id === shop.id ? { ...b, status: newStatus } : b)));
  }

  async function changePlan(shop: Barbershop, plan: string) {
    await supabase.from('barbershops').update({ plan }).eq('id', shop.id);
    setBarbershops((prev) => prev.map((b) => (b.id === shop.id ? { ...b, plan } : b)));
  }

  async function remove(shop: Barbershop) {
    if (!confirm(`¿Eliminar "${shop.name}" y TODOS sus datos (citas, servicios, barberos)? No se puede deshacer.`)) {
      return;
    }
    await supabase.from('barbershops').delete().eq('id', shop.id);
    setBarbershops((prev) => prev.filter((b) => b.id !== shop.id));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <p className="font-semibold">Panel de administrador</p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 grid grid-cols-3 gap-4">
          <StatCard label="Barberías" value={barbershops.length} />
          <StatCard label="Usuarios" value={totalUsers} />
          <StatCard label="Citas totales" value={totalAppointments} />
        </div>

        <input
          placeholder="Buscar por nombre, slug o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm"
        />

        <div className="flex flex-col gap-2">
          {filtered.map((shop) => (
            <div key={shop.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {shop.name}{' '}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        shop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {shop.status === 'active' ? 'Activa' : 'Suspendida'}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {shop.slug}.midominio.com · {shop.city ?? 'sin ciudad'} ·{' '}
                    {shop.appointments?.[0]?.count ?? 0} citas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={shop.plan}
                    onChange={(e) => changePlan(shop, e.target.value)}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
                  >
                    {Object.entries(PLAN_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Link
                    href={`/s/${shop.slug}`}
                    target="_blank"
                    className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    Ver web
                  </Link>
                  <button
                    onClick={() => toggleStatus(shop)}
                    className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                  >
                    {shop.status === 'active' ? 'Suspender' : 'Reactivar'}
                  </button>
                  <button
                    onClick={() => remove(shop)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-gray-400">No hay barberías que coincidan con la búsqueda.</p>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
