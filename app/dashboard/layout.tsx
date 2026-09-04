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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{barbershop.name}</p>
            <p className="text-xs text-gray-400">{barbershop.slug}.midominio.com</p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-600 hover:text-black">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
    </div>
  );
}
