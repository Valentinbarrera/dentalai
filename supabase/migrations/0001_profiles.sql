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
