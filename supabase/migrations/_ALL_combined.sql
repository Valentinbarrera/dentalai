-- ============================================================
-- DentalAI · TODAS las migraciones (0001 → 0007) en un solo archivo
-- Pegar en Supabase → SQL Editor → Run (idempotente, se puede re-correr).
-- ============================================================

-- >>>>>>>>>> 0001_profiles.sql <<<<<<<<<<
-- ============================================================
-- DentalAI · Migración 0001 — perfiles y roles
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- ============================================================

-- 1) Tabla de perfiles: una fila por usuario, con su rol.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  role        text not null default 'paciente'
              check (role in ('paciente', 'odontologo')),
  -- Solo para odontólogos: estado de verificación de la matrícula.
  verified    text not null default 'pendiente'
              check (verified in ('pendiente', 'verificado', 'rechazado')),
  created_at  timestamptz not null default now()
);

-- 2) Row Level Security: cada usuario ve y edita solo su propio perfil.
alter table public.profiles enable row level security;

drop policy if exists "perfil propio: ver" on public.profiles;
create policy "perfil propio: ver"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "perfil propio: editar" on public.profiles;
create policy "perfil propio: editar"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Nota: el INSERT lo hace el trigger de abajo (con privilegios elevados),
-- así que no hace falta una policy de insert para el usuario.

-- 3) Al crearse un usuario en auth.users, creamos su perfil automáticamente,
--    tomando full_name y role de los metadatos del registro.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'paciente')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- >>>>>>>>>> 0002_analyses.sql <<<<<<<<<<
-- ============================================================
-- DentalAI · Migración 0002 — análisis y storage de capturas
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- Requiere haber corrido antes 0001_profiles.sql.
-- ============================================================

-- 1) Tabla de análisis: una fila por scan del paciente + su diagnóstico.
create table if not exists public.analyses (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'subiendo'
              check (status in ('subiendo', 'procesando', 'listo', 'error')),
  -- Diagnóstico ya calculado (shape de src/lib/diagnosis.ts); null hasta que está listo.
  result      jsonb,
  created_at  timestamptz not null default now()
);

-- Índice para listar rápido los análisis de un usuario, del más nuevo al más viejo.
create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

-- 2) Row Level Security: cada usuario ve/inserta/edita solo lo suyo.
alter table public.analyses enable row level security;

drop policy if exists "análisis propio: ver" on public.analyses;
create policy "análisis propio: ver"
  on public.analyses for select
  using (auth.uid() = user_id);

drop policy if exists "análisis propio: insertar" on public.analyses;
create policy "análisis propio: insertar"
  on public.analyses for insert
  with check (auth.uid() = user_id);

drop policy if exists "análisis propio: editar" on public.analyses;
create policy "análisis propio: editar"
  on public.analyses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3) Storage: bucket privado `captures` para las fotos + video del scan.
-- ============================================================

insert into storage.buckets (id, name, public)
values ('captures', 'captures', false)
on conflict (id) do nothing;

-- Cada usuario accede solo a su carpeta: la ruta es `${user_id}/${analysis_id}/...`,
-- así que el primer segmento del path tiene que ser su propio uid.

drop policy if exists "capturas propias: ver" on storage.objects;
create policy "capturas propias: ver"
  on storage.objects for select
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "capturas propias: subir" on storage.objects;
create policy "capturas propias: subir"
  on storage.objects for insert
  with check (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "capturas propias: actualizar" on storage.objects;
create policy "capturas propias: actualizar"
  on storage.objects for update
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "capturas propias: borrar" on storage.objects;
create policy "capturas propias: borrar"
  on storage.objects for delete
  using (
    bucket_id = 'captures'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- >>>>>>>>>> 0003_appointments.sql <<<<<<<<<<
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


-- >>>>>>>>>> 0004_credentials.sql <<<<<<<<<<
-- ============================================================
-- DentalAI · Migración 0004 — credenciales del odontólogo
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- Requiere la migración 0001 (tabla public.profiles).
-- ============================================================

-- 1) Columnas extra en profiles para los datos de la matrícula.
--    (Idempotente: no pisa lo existente.)
alter table public.profiles add column if not exists matricula   text;
alter table public.profiles add column if not exists university  text;

-- 2) Bucket de storage privado para los títulos/diplomas.
--    Privado: solo se accede vía políticas RLS y URLs firmadas.
insert into storage.buckets (id, name, public)
values ('credentials', 'credentials', false)
on conflict do nothing;

-- 3) Políticas RLS de storage: cada usuario accede SOLO a su carpeta,
--    identificada por el primer segmento del path (`${auth.uid()}/...`).

drop policy if exists "credenciales propias: ver" on storage.objects;
create policy "credenciales propias: ver"
  on storage.objects for select
  using (
    bucket_id = 'credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "credenciales propias: subir" on storage.objects;
create policy "credenciales propias: subir"
  on storage.objects for insert
  with check (
    bucket_id = 'credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "credenciales propias: actualizar" on storage.objects;
create policy "credenciales propias: actualizar"
  on storage.objects for update
  using (
    bucket_id = 'credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'credentials'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- >>>>>>>>>> 0005_patient_visibility.sql <<<<<<<<<<
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


-- >>>>>>>>>> 0006_dentists.sql <<<<<<<<<<
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


-- >>>>>>>>>> 0007_videos.sql <<<<<<<<<<
-- ============================================================
-- DentalAI · Migración 0007 — videos educativos
-- Pegar en Supabase → SQL Editor → Run (una sola vez).
-- ============================================================
--
-- Biblioteca de videos educativos, de lectura general para toda la app.
-- Arranca VACÍA: el contenido real se carga después desde un panel/admin.
-- Los usuarios comunes solo LEEN; no hay insert/update para ellos.

-- 1) Tabla de videos.
create table if not exists public.videos (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  category       text,
  thumbnail_url  text,
  video_url      text,
  duration       text,
  created_at     timestamptz not null default now()
);

-- 2) Índice: la biblioteca se lista/agrupa por categoría y orden cronológico.
create index if not exists videos_category_created_idx
  on public.videos (category, created_at desc);

-- 3) Row Level Security.
alter table public.videos enable row level security;

-- SELECT: contenido educativo de lectura general para cualquier usuario autenticado.
drop policy if exists "videos: lectura pública para autenticados" on public.videos;
create policy "videos: lectura pública para autenticados"
  on public.videos for select
  to authenticated
  using (true);

-- Nota: sin policies de insert/update/delete para usuarios comunes.
-- La carga de contenido se hace por panel/admin (rol de servicio).

