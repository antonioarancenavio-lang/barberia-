import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tu barbería, tus citas, todo en un solo lugar',
  description: 'Plataforma de reservas para barberías',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
