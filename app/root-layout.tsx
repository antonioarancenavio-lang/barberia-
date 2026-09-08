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
    default: 'Cortia — Tu barbería. Tu agenda. Todo bajo control.',
    template: '%s · Cortia',
  },
  description: 'Gestiona tus citas, barberos y reservas online desde un solo lugar.',
  keywords: ['barbería', 'reservas online', 'gestión de citas', 'agenda barbería', 'software barbería'],
  openGraph: {
    title: 'Cortia — Tu barbería. Tu agenda. Todo bajo control.',
    description: 'Gestiona tus citas, barberos y reservas online desde un solo lugar.',
    url: SITE_URL,
    siteName: 'Cortia',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cortia — Tu barbería. Tu agenda. Todo bajo control.',
    description: 'Gestiona tus citas, barberos y reservas online desde un solo lugar.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable + ' ' + fraunces.variable}>
      <body className="bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
