import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Dominio raiz sin puerto, ej. "midominio.com" (o "localhost" en desarrollo).
const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000').split(':')[0];

/**
 * A partir del header Host de la request, devuelve el subdominio (slug de la
 * barberia) o null si es el dominio raiz / www.
 *
 * Soporta tanto produccion (barberia-garcia.midominio.com) como desarrollo
 * local (barberia-garcia.localhost:3000).
 */
function extractSubdomain(host: string): string | null {
  const cleanHost = host.split(':')[0];

  if (cleanHost === ROOT_DOMAIN || cleanHost === `www.${ROOT_DOMAIN}`) {
    return null;
  }

  if (ROOT_DOMAIN === 'localhost' && cleanHost.endsWith('.localhost')) {
    return cleanHost.replace('.localhost', '');
  }

  if (cleanHost.endsWith(`.${ROOT_DOMAIN}`)) {
    return cleanHost.slice(0, -(ROOT_DOMAIN.length + 1));
  }

  return null;
}

// Rutas que NUNCA deben reescribirse aunque se visiten desde un subdominio
// (por ahora ninguna barberia tiene dashboard propio en su subdominio: el
// dashboard, login, registro y admin viven siempre en el dominio raiz).
const INTERNAL_PREFIXES = ['/dashboard', '/admin', '/api', '/login', '/register', '/s/'];

function isInternalPath(pathname: string) {
  return INTERNAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const subdomain = extractSubdomain(host);

  const url = request.nextUrl.clone();

  if (subdomain && !isInternalPath(url.pathname)) {
    // Reescribe internamente barberia-garcia.midominio.com/  ->  /s/barberia-garcia/
    // El usuario nunca ve /s/barberia-garcia en la barra de direcciones.
    url.pathname = `/s/${subdomain}${url.pathname}`;
  }

  const response = NextResponse.rewrite(url);

  // Refresca la sesion de Supabase igual que en la Fase 1, ahora combinado
  // con el rewrite de arriba en un unico middleware.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
