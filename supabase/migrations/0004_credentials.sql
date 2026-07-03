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
