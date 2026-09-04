'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AjustesPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [id, setId] = useState('');
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#111111');

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: shop } = await supabase
        .from('barbershops')
        .select('id, slug, name, description, address, city, phone, logo_url, primary_color')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (shop) {
        setId(shop.id);
        setSlug(shop.slug);
        setName(shop.name ?? '');
        setDescription(shop.description ?? '');
        setAddress(shop.address ?? '');
        setCity(shop.city ?? '');
        setPhone(shop.phone ?? '');
        setLogoUrl(shop.logo_url ?? '');
        setPrimaryColor(shop.primary_color ?? '#111111');
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await supabase
      .from('barbershops')
      .update({
        name,
        description: description || null,
        address: address || null,
        city: city || null,
        phone: phone || null,
        logo_url: logoUrl || null,
        primary_color: primaryColor,
      })
      .eq('id', id);
    setSaving(false);
    setSaved(true);
  }

  const publicUrl = `https://${slug}.midominio.com`;

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <p className="text-gray-400">Cargando...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Ajustes</h1>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <p className="mb-2 text-sm font-medium text-gray-500">Tu página pública</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-gray-100 px-3 py-2 text-sm">{publicUrl}</code>
          <button
            onClick={copyLink}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Nota: el subdominio real solo funcionará cuando conectes un dominio propio (ver README de la Fase 2).
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
        <p className="text-sm font-medium text-gray-500">Datos de la barbería</p>
        <input
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Descripción"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          rows={3}
        />
        <input
          placeholder="Dirección"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="URL del logo (https://...)"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          Color principal
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-8 w-14 rounded border border-gray-300"
          />
        </label>

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="self-start rounded-lg bg-brand px-4 py-2 text-sm text-white hover:bg-brand-light disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        {saved && <span className="text-sm text-green-600">Guardado ✓</span>}
      </div>
    </div>
  );
}
