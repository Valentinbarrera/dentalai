-- ============================================================
-- DentalAI · Migración 0005 — visibilidad del perfil del paciente
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- ============================================================
--
-- Objetivo: que un odontólogo pueda leer el perfil básico (p. ej. `full_name`)
-- de los pacientes que tienen un turno con él, para mostrar el NOMBRE REAL del
-- paciente en la agenda del portal (`src/app/portal.tsx`).
--
-- Esta policy SE SUMA a "perfil propio: ver" (migración 0001); no la reemplaza.
-- Con RLS, varias policies de SELECT se combinan con OR: cada usuario sigue
-- viendo su propio perfil, y además el odontólogo ve el de sus pacientes.

-- SELECT: el odontólogo ve el perfil de un paciente SOLO si existe un turno
--         suyo (dentist_id = auth.uid()) con ese paciente (patient_id = profiles.id).
drop policy if exists "perfil paciente: ver si tiene turno con el odontólogo" on public.profiles;
create policy "perfil paciente: ver si tiene turno con el odontólogo"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.appointments a
      where a.dentist_id = auth.uid()
        and a.patient_id = profiles.id
    )
  );
