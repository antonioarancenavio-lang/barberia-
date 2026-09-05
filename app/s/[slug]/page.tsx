import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { BookingWidget } from './BookingWidget';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

export default async function TenantPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const shopResult = await supabase.rpc('get_barbershop_public', {
    check_slug: params.slug,
  });

  const shopRows = shopResult.data;
  const shop = Array.isArray(shopRows) && shopRows.length > 0 ? shopRows[0] : null;

  if (!shop) {
    notFound();
  }

  const servicesResult = await supabase.rpc('get_services_public', { p_barbershop_id: shop.id });
  const barbersResult = await supabase.rpc('get_barbers_public', { p_barbershop_id: shop.id });
  const hoursResult = await supabase.rpc('get_business_hours_public', { p_barbershop_id: shop.id });

  const services = servicesResult.data || [];
  const barbers = barbersResult.data || [];
  const hours = hoursResult.data || [];

  const accent = shop.primary_color || '#1d1d1f';
  const gradientStyle = {
    background: 'radial-gradient(circle at 50% -10%, ' + accent + '55 0%, #0a0a0a 55%)',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f5f5f7' }}>
      <section style={{ ...gradientStyle, padding: '96px 24px 80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {shop.logo_url ? (
            <Image
              src={shop.logo_url}
              alt={shop.name}
              width={72}
              height={72}
              style={{ borderRadius: '999px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '999px',
                background: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 600,
                color: 'white',
              }}
            >
              {shop.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, color: 'white' }}>
            {shop.name}
          </h1>

          {shop.description && (
            <p style={{ maxWidth: 420, fontSize: 16, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)' }}>
              {shop.description}
            </p>
          )}

          <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.4)' }}>
            {shop.address ? shop.address + ' - ' : ''}
            {shop.city}
          </p>
        </div>
      </section>

      <div style={{ padding: '64px 24px' }}>
        {hours.length > 0 && (
          <div
            style={{
              maxWidth: 640,
              margin: '0 auto',
              background: 'white',
              borderRadius: 16,
              padding: '20px 24px',
              boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
            }}
          >
            {hours.map((h: any, i: number) => (
              <div
                key={h.day_of_week}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 14,
                  borderBottom: i < hours.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}
              >
                <span style={{ color: '#86868b' }}>{DAY_NAMES[h.day_of_week]}</span>
                <span style={{ fontWeight: 500, color: '#1d1d1f' }}>
                  {h.closed ? 'Cerrado' : (h.open_time || '').slice(0, 5) + ' - ' + (h.close_time || '').slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div id="reserva" style={{ marginTop: 40, scrollMarginTop: 40 }}>
          <BookingWidget
            barbershopId={shop.id}
            services={services}
            barbers={barbers}
            businessHours={hours}
          />
        </div>
      </div>
    </main>
  );
}
