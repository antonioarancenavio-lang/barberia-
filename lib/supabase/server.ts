import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Cliente de Supabase para usar en Server Components, Server Actions y Route Handlers.
 * Lee/escribe la sesion a traves de las cookies de Next.js.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Se puede ignorar si se llama desde un Server Component sin permiso de escritura;
            // el middleware se encarga de refrescar la sesion en ese caso.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Idem: seguro ignorarlo aqui, lo gestiona el middleware.
          }
        },
      },
    }
  );
}

/**
 * Cliente con Service Role (bypassa RLS). SOLO para uso en servidor de confianza:
 * scripts de seed, tareas de admin, webhooks de Stripe. Nunca importar en un Client Component.
 */
export function createServiceRoleClient() {
  const { createClient: createSupabaseClient } = require('@supabase/supabase-js');
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
