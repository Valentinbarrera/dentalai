-- ============================================================
-- DentalAI · Migración 0009 — rol admin + catálogo de precios
-- Pegar en Supabase → SQL Editor → Run (idempotente).
-- Requiere 0001 (profiles).
-- ============================================================
--
-- Habilita el panel de administración: un rol `admin` (designado a mano) que
-- mantiene una lista de precios (tabla `procedures`). La IA usará esos precios
-- para armar los presupuestos (Fase B); acá va solo el modelo + permisos.

-- ------------------------------------------------------------
-- 1) Sumar 'admin' a los roles permitidos en profiles.
-- ------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('paciente', 'odontologo', 'admin'));

-- ------------------------------------------------------------
-- 2) Catálogo de precios (editable SOLO por el admin).
--    Precio UNITARIO por ítem; la IA combina ítems+cantidades y el back suma.
-- ------------------------------------------------------------
create table if not exists public.procedures (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text,
  unit_price  numeric(12,2) not null default 0,
  unit        text not null default 'unidad',
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists procedures_category_idx on public.procedures (category, name);

alter table public.procedures enable row level security;

-- Lectura: cualquier usuario autenticado (el panel admin + el flujo de presupuesto).
drop policy if exists "precios: lectura autenticada" on public.procedures;
create policy "precios: lectura autenticada"
  on public.procedures for select
  to authenticated
  using (true);

-- Escritura (insert/update/delete): SOLO admin.
drop policy if exists "precios: admin inserta" on public.procedures;
create policy "precios: admin inserta"
  on public.procedures for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "precios: admin edita" on public.procedures;
create policy "precios: admin edita"
  on public.procedures for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "precios: admin borra" on public.procedures;
create policy "precios: admin borra"
  on public.procedures for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- ------------------------------------------------------------
-- CÓMO DESIGNAR UN ADMIN (ejecutá con TU email, una sola vez).
-- Se actualizan dos lugares: user_metadata (para el ruteo de la app) y
-- profiles.role (para las policies RLS de arriba).
--
--   update auth.users
--     set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'
--     where email = 'TU-EMAIL@ejemplo.com';
--
--   update public.profiles set role = 'admin'
--     where id = (select id from auth.users where email = 'TU-EMAIL@ejemplo.com');
-- ------------------------------------------------------------
