'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    barbershopName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    slug: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Autogenera el slug a partir del nombre mientras el usuario no lo edite a mano.
      if (key === 'barbershopName') next.slug = slugify(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
      setLoading(true);
    setError(null);

    const slug = slugify(form.slug);

    // 1. Comprobar disponibilidad del slug
    const { data: available, error: slugError } = await (supabase.rpc as any)('slug_is_available', {
      check_slug: slug,
    });

    if (slugError || !available) {
      setError('Ese slug/subdominio ya está en uso. Prueba con otro.');
      setLoading(false);
      return;
    }

    // 2. Crear el usuario en Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.ownerName, role: 'barbershop_owner' } },
    });

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message ?? 'No se pudo crear la cuenta.');
      setLoading(false);
      return;
    }

    // 3. Crear la barbería asociada al owner recien creado.
    // Nota: si el proyecto de Supabase tiene "Confirm email" activado, no habra
    // sesion todavia y esta insercion fallara por RLS hasta que el usuario
    // confirme su email e inicie sesion. Ver README para desactivarlo en dev.
    const { error: shopError } = await supabase.from('barbershops').insert({
      owner_id: signUpData.user.id,
      name: form.barbershopName,
      slug,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
    });

    if (shopError) {
      setError(`Cuenta creada, pero no se pudo crear la barbería: ${shopError.message}`);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-2xl font-bold">Crea tu barbería</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          placeholder="Nombre de la barbería"
          value={form.barbershopName}
          onChange={(e) => update('barbershopName', e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Subdominio:</span>
          <input
            required
            value={form.slug}
            onChange={(e) => update('slug', slugify(e.target.value))}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5"
          />
          <span>.midominio.com</span>
        </div>
        <input
          required
          placeholder="Tu nombre"
          value={form.ownerName}
          onChange={(e) => update('ownerName', e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          required
          type="password"
          placeholder="Contraseña"
          minLength={8}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          placeholder="Dirección"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        <input
          placeholder="Ciudad"
          value={form.city}
          onChange={(e) => update('city', e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand px-4 py-2 text-white hover:bg-brand-light disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear mi barbería'}
        </button>
      </form>
    </main>
  );
}
