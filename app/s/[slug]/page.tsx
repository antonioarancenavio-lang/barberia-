import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { BookingWidget } from './BookingWidget';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default async function TenantPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: shopRows } = await supabase.rpc('get_barbershop_public', {
    check_slug: params.slug,
  });
  const shop = Array.isArray(shopRows) ? shopRows[0] : null;

  if (!shop) {
    notFound();
  }

  const [{ data: services }, { data: barbers }, { data: hours }] = await Promise.all([
    supabase.rpc('get_services_public', { p_barbershop_id: shop.id }),
    supabase.rpc('get_barbers_public', { p_barbershop_id: shop.id }),
    supabase.rpc('get_business_hours_public', { p_barbershop_id: shop.id }),
  ]);

  const accent = shop.primary_color || '#1d1d1f';

  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      {/* Portada */}
      <section
        className="relative overflow-hidden px-6 pb-20 pt-24 text-center"
        style={{
          background: `radial-gradient(circle at 50% -10%, ${accent}55 0%, #0a0a0a 55%)`,
        }}
      >
        <div className="relative mx-auto flex max-w-lg flex-col items-center gap-5">
          {shop.logo_url ? (
            <Image
              src={shop.logo_url}
              alt={shop.name}
              width={72}
              height={72}
              className="rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-semibold text-white"
              style={{ backgroundColor: accent }}
            >
              {shop.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-[40px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[52px]">
            {shop.name}
          </h1>
