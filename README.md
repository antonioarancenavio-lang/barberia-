# Barbería SaaS — Fase 1: arquitectura + base de datos + autenticación

Esta fase incluye:

- Proyecto Next.js 14 + TypeScript + Tailwind CSS listo para ejecutar.
- Esquema completo de Supabase (8 tablas) con Row Level Security multi-tenant.
- Autenticación con Supabase Auth (registro con creación de barbería, login).
- Rutas protegidas `/dashboard` (owner) y `/admin` (platform_admin) — placeholders
  funcionales que ya demuestran el aislamiento de datos por tenant.
- Middleware que refresca la sesión en cada request (la detección de
  subdominio se añade en la Fase 2).

## 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y pega el contenido completo de `supabase/schema.sql`. Ejecútalo.
3. Ve a **Authentication → Providers → Email** y, para desarrollo, desactiva
   "Confirm email" (si lo dejas activo, el flujo de registro creará el usuario
   pero no podrá crear la barbería hasta confirmar el correo, por la RLS).
4. Ve a **Project Settings → API** y copia `Project URL` y `anon public key`.
5. Copia también la `service_role key` (Project Settings → API) — solo para el
   script de seed, nunca la expongas en el cliente.

## 2. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`SUPABASE_SERVICE_ROLE_KEY` con los valores del paso anterior. Las variables
de `NEXT_PUBLIC_ROOT_DOMAIN` y Stripe se usan a partir de la Fase 2 y 6 — de
momento puedes dejarlas con el valor de ejemplo.

## 3. Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## 4. (Opcional) Sembrar datos de demostración

```bash
npm install -D tsx dotenv
npx tsx scripts/seed.ts
```

Ver `supabase/seed.md` para las credenciales de las 3 barberías de prueba.

## 5. Convertir tu propio usuario en platform_admin

Por SQL Editor, tras registrarte una vez desde la app:

```sql
update public.profiles set role = 'platform_admin' where id = '<tu-user-id>';
```

---

## Qué comprobar antes de pasar a la Fase 2

- [ ] `npm run dev` arranca sin errores.
- [ ] Puedes registrarte en `/register`, se crea el usuario en **Authentication → Users**
      y una fila en `barbershops` con tu `owner_id`.
- [ ] El slug duplicado se rechaza (prueba a registrar dos barberías con el mismo nombre).
- [ ] Al iniciar sesión en `/login` te redirige a `/dashboard` y ves el nombre y slug
      de **tu propia** barbería (no la de otro usuario).
- [ ] Con dos cuentas distintas (o los 3 datos demo), confirma que cada una solo
      ve su propia barbería — esto valida que las políticas RLS funcionan.
- [ ] `/admin` redirige a `/dashboard` si tu rol no es `platform_admin`, y te deja
      entrar si lo cambias manualmente por SQL.
- [ ] En Supabase → Table Editor, revisa que las 8 tablas existen con RLS
      "Enabled" (icono de escudo verde).

Cuando todo esto funcione, pasamos a la **Fase 2: sistema multi-tenant +
subdominios** (middleware que resuelve `slug` → `barbershop_id` a partir del
`host`, y wildcard DNS en Vercel).
