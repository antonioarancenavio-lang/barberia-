import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { BookingWidget } from './BookingWidget';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];

function getOpenStatus(hours: any[]) {
  const now = new Date();
  const today = hours.find((h) => h.day_of_week === now.getDay());

  if (!today || today.closed || !today.open_time || !today.close_time) {
    return 'Cerrado hoy';
  }

  const [oh, om] = today.open_time.split(':').map(Number);
  const [ch, cm] = today.close_time.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  if (nowMinutes < openMinutes) {
    return 'Cerrado ahora · abre a las ' + today.open_time.slice(0, 5);
  }
  if (nowMinutes >= closeMinutes) {
    return 'Cerrado por hoy';
  }
  return 'Abierto ahora · cierra a las ' + today.close_time.slice(0, 5);
}

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

  const accent = shop.primary_color || '#17171A';
  const gradientStyle = {
    background: 'radial-gradient(circle at 50% -10%, ' + accent + '55 0%, #17171A 55%)',
  };
  const openStatus = hours.length > 0 ? getOpenStatus(hours) : null;

  return (
    <main style={{ minHeight: '100vh', background: '#FAF9F6' }}>
      <section style={{ ...gradientStyle, padding: '96px 24px 64px 24px', textAlign: 'center' }}>
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

          <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 44, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.05, color: '#FAF9F6' }}>
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

          {openStatus && (
            <details style={{ marginTop: 4 }}>
              <summary
                style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.75)',
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '999px', background: accent, display: 'inline-block' }} />
                {openStatus}
              </summary>
              <div style={{ marginTop: 16, textAlign: 'left', maxWidth: 260, margin: '16px auto 0 auto' }}>
                {hours.map((h: any) => (
                  <div
                    key={h.day_of_week}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12.5 }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{DAY_NAMES[h.day_of_week]}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {h.closed ? 'Cerrado' : (h.open_time || '').slice(0, 5) + ' - ' + (h.close_time || '').slice(0, 5)}
                    </span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </section>

      <div style={{ padding: '48px 24px 64px 24px' }}>
        <div id="reserva" style={{ scrollMarginTop: 40 }}>
          <BookingWidget
            barbershopId={shop.id}
            services={services}
            barbers={barbers}
            businessHours={hours}
            accentColor={accent}
          />
        </div>
      </div>
    </main>
  );
}
