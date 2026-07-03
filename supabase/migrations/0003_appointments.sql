-- ============================================================
-- DentalAI · Migración 0003 — turnos (appointments)
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- ============================================================
--
-- Fuente ÚNICA de turnos, compartida por ambos roles:
-- el booking del paciente escribe acá y la agenda del odontólogo lee de acá.
-- El RLS decide qué filas ve cada usuario según auth.uid().

-- 1) Tabla de turnos.
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  patient_id    uuid not null references auth.users (id) on delete cascade,
  dentist_id    uuid not null references auth.users (id) on delete cascade,
  starts_at     timestamptz not null,
  duration_min  int not null,
  type          text not null,
  status        text not null default 'pendiente'
                check (status in ('pendiente', 'confirmado', 'completado', 'cancelado')),
  note          text,
  created_at    timestamptz not null default now()
);

-- 2) Índices: la agenda del odontólogo consulta por (dentist_id, starts_at);
--    el paciente consulta por patient_id.
create index if not exists appointments_dentist_starts_idx
  on public.appointments (dentist_id, starts_at);

create index if not exists appointments_patient_idx
  on public.appointments (patient_id);

-- 3) Row Level Security.
alter table public.appointments enable row level security;

-- SELECT: ve el turno cualquiera de las dos partes (el paciente o el odontólogo).
drop policy if exists "turnos: ver los propios" on public.appointments;
create policy "turnos: ver los propios"
  on public.appointments for select
  using (auth.uid() = patient_id or auth.uid() = dentist_id);

-- INSERT: el turno lo crea el paciente (booking); solo puede crearse a sí mismo como paciente.
drop policy if exists "turnos: el paciente crea" on public.appointments;
create policy "turnos: el paciente crea"
  on public.appointments for insert
  with check (auth.uid() = patient_id);

-- UPDATE: el paciente gestiona sus turnos; el odontólogo también gestiona los suyos
--         (p. ej. confirmar/cancelar desde el portal).
drop policy if exists "turnos: gestionar los propios" on public.appointments;
create policy "turnos: gestionar los propios"
  on public.appointments for update
  using (auth.uid() = patient_id or auth.uid() = dentist_id)
  with check (auth.uid() = patient_id or auth.uid() = dentist_id);
