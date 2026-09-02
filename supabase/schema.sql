-- ============================================================================
-- BARBERIA SAAS - SCHEMA FASE 1 (arquitectura + BD + auth)
-- Ejecutar en el SQL Editor de Supabase (o via supabase db push)
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "btree_gist"; -- necesaria para el EXCLUDE de appointments

-- ============================================================================
-- 1. PROFILES  (extiende auth.users)
-- ============================================================================

create type user_role as enum ('platform_admin', 'barbershop_owner', 'barber');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'barbershop_owner',
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crea automaticamente un profile cuando se registra un usuario en auth.users
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'barbershop_owner')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 2. BARBERSHOPS (tenants)
-- ============================================================================

create type plan_type as enum ('free', 'pro', 'premium');
create type shop_status as enum ('active', 'suspended');

create table public.barbershops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  email text,
  phone text,
  address text,
  city text,
  description text,
  logo_url text,
  primary_color text default '#111111',
  plan plan_type not null default 'free',
  status shop_status not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index idx_barbershops_owner on public.barbershops(owner_id);
create index idx_barbershops_slug on public.barbershops(slug);

-- ============================================================================
-- 3. BARBERS
-- ============================================================================

create table public.barbers (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null, -- opcional: login propio
  name text not null,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_barbers_barbershop on public.barbers(barbershop_id);
create index idx_barbers_profile on public.barbers(profile_id);

-- ============================================================================
-- 4. SERVICES
-- ============================================================================

create table public.services (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  duration_minutes int not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_services_barbershop on public.services(barbershop_id);

-- ============================================================================
-- 5. BUSINESS_HOURS
-- ============================================================================

create table public.business_hours (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6), -- 0 = domingo
  open_time time,
  close_time time,
  closed boolean not null default false,
  unique (barbershop_id, day_of_week)
);

create index idx_business_hours_barbershop on public.business_hours(barbershop_id);

-- ============================================================================
-- 6. BLOCKED_TIMES
-- ============================================================================

create table public.blocked_times (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  barber_id uuid references public.barbers(id) on delete cascade, -- null = toda la barberia
  start_time timestamptz not null,
  end_time timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint blocked_times_range check (end_time > start_time)
);

create index idx_blocked_times_barbershop on public.blocked_times(barbershop_id);
create index idx_blocked_times_barber on public.blocked_times(barber_id);

-- ============================================================================
-- 7. APPOINTMENTS
-- ============================================================================

create type appointment_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null references public.barbershops(id) on delete cascade,
  barber_id uuid not null references public.barbers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  client_name text not null,
  client_phone text not null,
  client_email text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status appointment_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint appointment_range check (end_time > start_time),
  -- Impide que el mismo barbero tenga dos citas que se solapen (a nivel de BD),
  -- salvo que la cita este cancelada.
  exclude using gist (
    barber_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status <> 'cancelled')
);

create index idx_appointments_barbershop on public.appointments(barbershop_id);
create index idx_appointments_barber on public.appointments(barber_id);
create index idx_appointments_start on public.appointments(start_time);

-- ============================================================================
-- 8. SUBSCRIPTIONS
-- ============================================================================

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  barbershop_id uuid not null unique references public.barbershops(id) on delete cascade,
  plan plan_type not null default 'free',
  status text not null default 'active', -- active | past_due | canceled ...
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- 9. FUNCIONES AUXILIARES PARA RLS (SECURITY DEFINER evita recursion)
-- ============================================================================

create function public.is_platform_admin()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'platform_admin'
  );
$$;

-- Todas las barbershop_id a las que el usuario actual tiene acceso:
-- como propietario o como barbero con cuenta propia.
create function public.user_barbershop_ids()
returns setof uuid
language sql security definer stable set search_path = public
as $$
  select id from public.barbershops where owner_id = auth.uid()
  union
  select barbershop_id from public.barbers where profile_id = auth.uid();
$$;

-- Comprobacion de disponibilidad de slug, invocable desde el formulario de
-- registro (incluso antes de crear sesion) sin exponer el resto de columnas.
create function public.slug_is_available(check_slug text)
returns boolean
language sql security definer stable set search_path = public
as $$
  select not exists (select 1 from public.barbershops where slug = check_slug);
$$;

grant execute on function public.slug_is_available(text) to anon, authenticated;

-- ============================================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.barbershops enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.business_hours enable row level security;
alter table public.blocked_times enable row level security;
alter table public.appointments enable row level security;
alter table public.subscriptions enable row level security;

-- PROFILES: cada usuario ve/edita su propio perfil; el admin ve todos.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_platform_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- BARBERSHOPS: el owner gestiona la suya; el admin gestiona todas.
create policy "barbershops_select" on public.barbershops
  for select using (
    owner_id = auth.uid()
    or id in (select public.user_barbershop_ids())
    or public.is_platform_admin()
  );

create policy "barbershops_insert_own" on public.barbershops
  for insert with check (owner_id = auth.uid());

create policy "barbershops_update" on public.barbershops
  for update using (owner_id = auth.uid() or public.is_platform_admin());

create policy "barbershops_delete_admin" on public.barbershops
  for delete using (public.is_platform_admin());

-- Tablas "tenant": mismo patron para las 5 -> filtrar por user_barbershop_ids()
create policy "barbers_all" on public.barbers
  for all using (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  ) with check (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  );

create policy "services_all" on public.services
  for all using (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  ) with check (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  );

create policy "business_hours_all" on public.business_hours
  for all using (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  ) with check (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  );

create policy "blocked_times_all" on public.blocked_times
  for all using (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  ) with check (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  );

create policy "appointments_all" on public.appointments
  for all using (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  ) with check (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  );

-- SUBSCRIPTIONS: solo el owner de la barberia y el admin.
create policy "subscriptions_select" on public.subscriptions
  for select using (
    barbershop_id in (select public.user_barbershop_ids()) or public.is_platform_admin()
  );

create policy "subscriptions_admin_write" on public.subscriptions
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ============================================================================
-- NOTA IMPORTANTE (Fase 3):
-- La pagina publica de reservas necesitara politicas adicionales de SELECT
-- para usuarios anonimos (anon) sobre barbershops/services/barbers/business_hours
-- (solo lectura, solo de barberias con status='active'), y una politica de
-- INSERT anonima y acotada sobre appointments. Se añadiran en esa fase para no
-- abrir mas superficie de la necesaria todavia.
-- ============================================================================
