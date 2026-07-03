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
