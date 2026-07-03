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
