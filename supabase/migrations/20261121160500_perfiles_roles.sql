-- Panel CommerceOS: perfiles con rol, plan, estado y último ingreso
-- Aplicada en el proyecto Supabase panel-commerceos el 2026-11-21

create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;
grant usage on schema privado to authenticated;

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text,
  empresa text,
  rol text not null default 'vendedor' check (rol in ('superadmin','empresa','vendedor')),
  plan text not null default 'gratis' check (plan in ('gratis','basico','pro')),
  estado text not null default 'pendiente' check (estado in ('activo','pendiente','suspendido')),
  ultimo_ingreso timestamptz,
  created_at timestamptz not null default now()
);
alter table public.perfiles enable row level security;

create or replace function privado.es_superadmin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfiles where id = (select auth.uid()) and rol = 'superadmin' and estado = 'activo');
$$;
revoke all on function privado.es_superadmin() from public, anon;
grant execute on function privado.es_superadmin() to authenticated;

-- Cada uno ve su perfil; el superadmin ve y modifica todos
create policy "ver mi perfil o todos si superadmin" on public.perfiles
  for select to authenticated
  using (id = (select auth.uid()) or (select privado.es_superadmin()));
create policy "solo superadmin modifica" on public.perfiles
  for update to authenticated
  using ((select privado.es_superadmin())) with check ((select privado.es_superadmin()));

revoke all on public.perfiles from anon;
revoke insert, delete, truncate on public.perfiles from authenticated;

-- Perfil automático al registrarse (queda vendedor, plan gratis, pendiente)
create or replace function privado.crear_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfiles (id, email, nombre, ultimo_ingreso)
  values (new.id, new.email, new.raw_user_meta_data->>'nombre', new.last_sign_in_at);
  return new;
end $$;
create trigger al_registrarse after insert on auth.users
  for each row execute function privado.crear_perfil();

-- Último ingreso: se copia cada vez que el usuario entra
create or replace function privado.copiar_ultimo_ingreso() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.perfiles set ultimo_ingreso = new.last_sign_in_at where id = new.id;
  return new;
end $$;
create trigger al_ingresar after update of last_sign_in_at on auth.users
  for each row when (new.last_sign_in_at is distinct from old.last_sign_in_at)
  execute function privado.copiar_ultimo_ingreso();
