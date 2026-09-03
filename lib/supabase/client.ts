import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para usar en Client Components ("use client").
 * Se crea uno nuevo por invocacion para evitar compartir estado entre requests.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
