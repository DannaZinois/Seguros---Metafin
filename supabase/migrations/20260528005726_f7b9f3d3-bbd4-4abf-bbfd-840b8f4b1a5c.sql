
-- Enum de roles
create type public.app_role as enum ('admin', 'company', 'client');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text,
  empresa_id text,
  cliente_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create policy "Users view own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

-- Invitations
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role public.app_role not null,
  token text not null unique,
  status text not null default 'pending', -- pending | accepted | expired
  empresa_id text,
  cliente_id text,
  nombre text,
  payload jsonb,
  attempts int not null default 0,
  last_sent_at timestamptz,
  expires_at timestamptz not null default (now() + interval '30 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_invitations_email on public.invitations(lower(email));
create index idx_invitations_status on public.invitations(status);

grant all on public.invitations to service_role;
alter table public.invitations enable row level security;
-- No policies: only service_role (via server fns) reads/writes.

-- Trigger: when a user signs up, create profile + mark invitation accepted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  inv record;
begin
  -- Find matching pending invitation
  select * into inv
  from public.invitations
  where lower(email) = lower(new.email)
    and status = 'pending'
  order by created_at desc
  limit 1;

  insert into public.profiles (id, email, nombre, empresa_id, cliente_id)
  values (
    new.id,
    new.email,
    coalesce(inv.nombre, new.raw_user_meta_data->>'nombre'),
    inv.empresa_id,
    inv.cliente_id
  )
  on conflict (id) do nothing;

  if inv.id is not null then
    insert into public.user_roles (user_id, role) values (new.id, inv.role)
      on conflict do nothing;
    update public.invitations
      set status = 'accepted', accepted_at = now(), updated_at = now()
      where id = inv.id;
  else
    -- default role = client
    insert into public.user_roles (user_id, role) values (new.id, 'client')
      on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
