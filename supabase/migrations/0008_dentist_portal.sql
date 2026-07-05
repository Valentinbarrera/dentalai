-- ============================================================
-- DentalAI · Migración 0008 — portal completo del odontólogo
-- Pegar en Supabase → SQL Editor → Run (una sola vez, idempotente).
-- Requiere 0001 (profiles), 0002 (analyses), 0003 (appointments), 0007 (videos).
-- ============================================================
--
-- Habilita tres cosas del portal del profesional:
--   1) que el odontólogo VEA los scans/diagnósticos de SUS pacientes,
--   2) datos de perfil profesional (bio + foto),
--   3) que el odontólogo cargue/gestione videos educativos propios.

-- ------------------------------------------------------------
-- 1) El odontólogo ve los análisis de sus pacientes.
--    Un paciente es "suyo" si existe un turno entre ambos.
--    Esta policy SE SUMA a "análisis propio: ver" (0002); con RLS, varias
--    policies de SELECT se combinan con OR: el paciente sigue viendo lo suyo
--    y además el odontólogo ve lo de sus pacientes.
-- ------------------------------------------------------------
drop policy if exists "análisis: el odontólogo ve los de sus pacientes" on public.analyses;
create policy "análisis: el odontólogo ve los de sus pacientes"
  on public.analyses for select
  to authenticated
  using (
    exists (
      select 1
      from public.appointments a
      where a.dentist_id = auth.uid()
        and a.patient_id = analyses.user_id
    )
  );

-- ------------------------------------------------------------
-- 2) Perfil profesional: biografía y foto (avatar).
--    (Idempotente: no pisa lo existente. El UPDATE del propio perfil ya está
--    permitido por "perfil propio: editar" de la migración 0001.)
-- ------------------------------------------------------------
alter table public.profiles add column if not exists bio        text;
alter table public.profiles add column if not exists avatar_url text;

-- ------------------------------------------------------------
-- 3) Videos educativos: autor + gestión por el odontólogo.
--    La lectura pública para autenticados ya está en 0007; acá sumamos autoría
--    y permisos de escritura para que el odontólogo cargue y gestione los suyos.
-- ------------------------------------------------------------
alter table public.videos
  add column if not exists author_id uuid references auth.users (id) on delete set null;

drop policy if exists "videos: el odontólogo carga" on public.videos;
create policy "videos: el odontólogo carga"
  on public.videos for insert
  to authenticated
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'odontologo'
    )
  );

drop policy if exists "videos: el autor edita" on public.videos;
create policy "videos: el autor edita"
  on public.videos for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "videos: el autor borra" on public.videos;
create policy "videos: el autor borra"
  on public.videos for delete
  to authenticated
  using (author_id = auth.uid());
