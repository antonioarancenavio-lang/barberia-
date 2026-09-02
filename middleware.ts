import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Fase 1: solo refrescamos la sesion de Supabase.
  // Fase 2 anadira aqui: leer request.headers.get('host'), extraer el subdominio,
  // resolver el barbershop_id correspondiente y reescribir la ruta internamente.
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
