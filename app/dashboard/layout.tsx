import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Hoy' },
  { href: '/dashboard/citas', label: 'Citas' },
  { href: '/dashboard/servicios', label: 'Servicios' },
  { href: '/dashboard/barberos', label: 'Barberos' },
  { href: '/dashboard/horario', label: 'Horario' },
  { href: '/dashboard/ajustes', label: 'Ajustes' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('name, slug')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!barbershop) {
    redirect('/register');
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-warm-100 bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg text-ink">{barbershop.name}</p>
            <p className="text-xs text-warm-500">{barbershop.slug}.midominio.com</p>
          </div>
          <nav className="flex flex-wrap gap-5 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </div>
  );
}
