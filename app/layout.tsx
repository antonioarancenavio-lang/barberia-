import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://barberia-i66v.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cortia — Agenda y reservas online para barberías',
    template: '%s · Cortia',
  },
  description: 'Software de gestión y reservas online para barberías. Deja que tus clientes reserven su cita sin WhatsApp, con tu propia agenda digital. Empieza gratis.',
  keywords: ['agenda barbería', 'reservas barbería', 'software barbería', 'citas barbería', 'reservas online barbería', 'gestión barbería', 'agenda digital barbería'],
  openGraph: {
    title: 'Cortia — Agenda y reservas online para barberías',
    description: 'Software de gestión y reservas online para barberías. Deja que tus clientes reserven su cita sin WhatsApp.',
    url: SITE_URL,
    siteName: 'Cortia',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cortia — Agenda y reservas online para barberías',
    description: 'Software de gestión y reservas online para barberías. Deja que tus clientes reserven su cita sin WhatsApp.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable + ' ' + fraunces.variable}>
      <body className="bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
