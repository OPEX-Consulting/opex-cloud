-- OPEX Cloud client requirements portal
-- Tables are accessed only by the Next.js server with the service role key.
-- RLS is enabled with NO policies, so anon/authenticated keys can read or write nothing.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- projects: one row per client engagement; token = unlisted private link
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id                        uuid primary key default gen_random_uuid(),
  token                     text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  customer_name             text,
  project_name              text,
  customer_address          text,
  opex_sales_contact_name   text,
  opex_sales_contact_email  text,
  opex_sales_contact_phone  text,
  -- internal team: never sent to the client
  project_manager           text,
  lead_engineer             text,
  deployment_engineer       text,
  status                    text not null default 'invited'
                            check (status in ('invited', 'in_progress', 'submitted', 'reviewed')),
  expires_at                timestamptz,
  submitted_at              timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- requirements: the questionnaire answers (steps 1-4 + inventory flags) as JSON
-- ---------------------------------------------------------------------------
create table if not exists public.requirements (
  project_id    uuid primary key references public.projects(id) on delete cascade,
  answers       jsonb not null default '{}'::jsonb,
  current_step  int not null default 0,
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- servers: inventory rows (Linux VMs / Windows VMs / physical servers)
-- vcpu holds CPU cores for physical servers. disks = extra disks in GiB.
-- details holds small extras: osOther, osType, roleOther, hypervisorOther.
-- ---------------------------------------------------------------------------
create table if not exists public.servers (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  kind         text not null check (kind in ('linux', 'windows', 'physical')),
  position     int not null default 0,
  vcpu         int,
  ram_gib      numeric,
  boot_gib     numeric,
  os           text,
  os_version   text,
  public_ips   int,
  kernel       text,
  hostname     text,
  role         text,
  hypervisor   text,
  dr_protect   text,
  fstab        text,
  lsblk        text,
  disks        jsonb not null default '[]'::jsonb,
  details      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists servers_project_kind_position_idx
  on public.servers (project_id, kind, position);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists requirements_set_updated_at on public.requirements;
create trigger requirements_set_updated_at
  before insert or update on public.requirements
  for each row execute function public.set_updated_at();

-- Touch the parent project whenever answers change, so updated_at reflects client activity.
create or replace function public.touch_project_from_requirements()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.projects set updated_at = now() where id = new.project_id;
  return new;
end;
$$;

drop trigger if exists requirements_touch_project on public.requirements;
create trigger requirements_touch_project
  after insert or update on public.requirements
  for each row execute function public.touch_project_from_requirements();

-- ---------------------------------------------------------------------------
-- Row Level Security: enabled, no policies => service role only
-- ---------------------------------------------------------------------------
alter table public.projects     enable row level security;
alter table public.requirements enable row level security;
alter table public.servers      enable row level security;

revoke all on public.projects, public.requirements, public.servers from anon, authenticated;
