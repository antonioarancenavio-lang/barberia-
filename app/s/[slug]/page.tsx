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
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="flex flex-col items-center gap-3 text-center">
        {shop.logo_url && (
          <Image
            src={shop.logo_url}
            alt={shop.name}
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        )}
        <h1 className="text-3xl font-bold">{shop.name}</h1>
        {shop.description && <p className="max-w-md text-gray-600">{shop.description}</p>}
        <p className="text-sm text-gray-500">
          {shop.address ? `${shop.address}, ` : ''}
          {shop.city}
        </p>
      </header>

      {hours && hours.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Horario</h2>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-700 sm:grid-cols-1">
            {hours.map((h: any) => (
              <li key={h.day_of_week} className="flex justify-between border-b border-gray-100 py-1">
                <span>{DAY_NAMES[h.day_of_week]}</span>
                <span>{h.closed ? 'Cerrado' : `${h.open_time?.slice(0, 5)} - ${h.close_time?.slice(0, 5)}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Reserva tu cita</h2>
        <BookingWidget
          barbershopId={shop.id}
          services={services ?? []}
          barbers={barbers ?? []}
          businessHours={hours ?? []}
        />
      </section>
    </main>
  );
}
