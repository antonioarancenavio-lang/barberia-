-- ============================================================================
-- RESET (solo para desarrollo) — borra todo lo creado por schema.sql
-- Ejecuta esto UNA VEZ, y despues vuelve a ejecutar supabase/schema.sql completo.
-- ============================================================================

drop table if exists public.subscriptions cascade;
drop table if exists public.appointments cascade;
drop table if exists public.blocked_times cascade;
drop table if exists public.business_hours cascade;
drop table if exists public.services cascade;
drop table if exists public.barbers cascade;
drop table if exists public.barbershops cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_platform_admin() cascade;
drop function if exists public.user_barbershop_ids() cascade;
drop function if exists public.slug_is_available(text) cascade;

drop trigger if exists on_auth_user_created on auth.users;

drop type if exists user_role cascade;
drop type if exists plan_type cascade;
drop type if exists shop_status cascade;
drop type if exists appointment_status cascade;
