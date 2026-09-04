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

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-6 py-16">
      <header className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
        {shop.logo_url && (
          <Image
            src={shop.logo_url}
            alt={shop.name}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        )}
        <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f]">{shop.name}</h1>
        {shop.description && <p className="text-[15px] leading-snug text-[#86868b]">{shop.description}</p>}
        <p className="text-[13px] text-[#86868b]">
          {shop.address ? `${shop.address} · ` : ''}
          {shop.city}
        </p>
      </header>

      {hours && hours.length > 0 && (
        <div className="mx-auto mt-8 max-w-sm rounded-2xl bg-white px-5 py-4 shadow-[0_2px_24px_rgba(0,0,0,0.06)]">
          {hours.map((h: any) => (
            <div
              key={h.day_of_week}
              className="flex justify-between border-b border-[#f0f0f0] py-2 text-[13px] last:border-0"
            >
              <span className="text-[#86868b]">{DAY_NAMES[h.day_of_week]}</span>
              <span className="font-medium text-[#1d1d1f]">
                {h.closed ? 'Cerrado' : `${h.open_time?.slice(0, 5)} – ${h.close_time?.slice(0, 5)}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10">
        <BookingWidget
          barbershopId={shop.id}
          services={services ?? []}
          barbers={barbers ?? []}
          businessHours={hours ?? []}
        />
      </div>
    </main>
  );
}
