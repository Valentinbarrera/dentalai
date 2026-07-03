-- ============================================================
-- DentalAI · Migración 0006 — odontólogos elegibles al reservar
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- Requiere la migración 0001 (tabla public.profiles).
-- ============================================================
--
-- Objetivo: que el flujo de booking del paciente muestre odontólogos REALES
-- (los que se registraron con rol 'odontologo') en lugar de datos mock, y que
-- al reservar se pueda propagar un `dentistId` real de `auth.users` como FK
-- válida del turno.

-- 1) Columna de especialidad del odontólogo (la elige/edita en su perfil).
--    (Idempotente: no pisa lo existente.)
alter table public.profiles add column if not exists specialty text;

-- 2) SELECT: cualquier usuario autenticado puede leer los perfiles de
--    odontólogos, para poder elegirlos al reservar un turno.
--
--    Esta policy SE SUMA a las existentes (migraciones 0001 y 0005); no las
--    reemplaza. Con RLS, varias policies de SELECT se combinan con OR: cada
--    usuario sigue viendo su propio perfil, el odontólogo ve el de sus
--    pacientes, y además todos ven a los odontólogos disponibles.
drop policy if exists "odontólogos: visibles para reservar" on public.profiles;
create policy "odontólogos: visibles para reservar"
  on public.profiles for select
  to authenticated
  using (role = 'odontologo');
