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

export const metadata: Metadata = {
  title: 'Cortia — Tu barbería. Tu agenda. Todo bajo control.',
  description: 'Gestiona tus citas, barberos y reservas online desde un solo lugar.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable + ' ' + fraunces.variable}>
      <body className="bg-bg font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
