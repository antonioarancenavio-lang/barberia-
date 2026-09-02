/**
 * Seed de datos de demostracion para la Fase 1.
 * Ejecutar con: npx tsx scripts/seed.ts
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local
 */
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_SHOPS = [
  { name: 'Barbería García', slug: 'barberia-garcia', email: 'garcia@demo.test', city: 'Madrid' },
  { name: 'Barbería Central', slug: 'barberia-central', email: 'central@demo.test', city: 'Sevilla' },
  { name: 'Fade Society', slug: 'fade-society', email: 'fadesociety@demo.test', city: 'Valencia' },
];

const DEMO_PASSWORD = 'Demo1234!';

async function main() {
  for (const shop of DEMO_SHOPS) {
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: shop.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `Dueño de ${shop.name}`, role: 'barbershop_owner' },
    });

    if (userError || !userData.user) {
      console.error(`✗ Error creando usuario para ${shop.name}:`, userError?.message);
      continue;
    }

    const { error: shopError } = await supabase.from('barbershops').insert({
      owner_id: userData.user.id,
      name: shop.name,
      slug: shop.slug,
      email: shop.email,
      city: shop.city,
      status: 'active',
      plan: 'free',
    });

    if (shopError) {
      console.error(`✗ Error creando barbería ${shop.name}:`, shopError.message);
      continue;
    }

    console.log(`✓ ${shop.name} creada (${shop.slug}.midominio.com) — login: ${shop.email} / ${DEMO_PASSWORD}`);
  }
}

main();
