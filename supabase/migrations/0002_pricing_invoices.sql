-- OPEX Cloud Phase 2: requirements to invoice.
-- Pricing data (replaces the "OPEX_Cloud_Quote_Builder" Google Sheet), FX history, admin audit, invoices, email outbox.
-- Same security model as 0001: RLS on, no policies, no anon/authenticated grants. Only the service role (Next.js server) reads/writes.

-- ---------------------------------------------------------------------------
-- Portal: per-server pricing answers, new statuses
-- ---------------------------------------------------------------------------
alter table public.servers add column if not exists backup text;       -- 'Yes' | 'No' | null
alter table public.servers add column if not exists replication text;  -- 'None' | 'Active-passive' | 'Active-active' | 'Not sure' | null

alter table public.projects drop constraint if exists projects_status_check;
alter table public.projects add constraint projects_status_check
  check (status in ('invited', 'in_progress', 'submitted', 'edited', 'resubmitted', 'reviewed'));
alter table public.projects add column if not exists submit_count int not null default 0;
alter table public.projects add column if not exists last_edited_at timestamptz;

-- ---------------------------------------------------------------------------
-- pricing_settings: key/value (value is jsonb: number, text or boolean)
-- ---------------------------------------------------------------------------
create table if not exists public.pricing_settings (
  key         text primary key,
  value       jsonb not null,
  label       text not null,
  note        text,
  sort        int not null default 0,
  updated_at  timestamptz not null default now()
);

insert into public.pricing_settings (key, value, label, note, sort) values
  ('vat',                         '0.075',          'VAT',                              'Nigerian VAT. Partner prices exclude VAT.', 1),
  ('unicloud_discount',           '0.1',            'UniCloud partner discount',        'From UniCloud partner letter.', 2),
  ('unitellas_discount',          '0.45',           'Unitellas discount',               'From Unitellas pricing calculator. Applied to all Unitellas items.', 3),
  ('hours_per_month',             '730',            'Hours per month (Unitellas)',      'Unitellas monthly rate = hourly rate × hours.', 4),
  ('gb_per_tb',                   '1000',           'GB per TB (Unitellas storage)',    'Change to 1024 if Unitellas bills per TiB.', 5),
  ('unicloud_internet_cap_mbps',  '100',            'UniCloud internet cap (Mbps)',     'Higher bandwidth is "To be quoted" on UniCloud.', 6),
  ('default_margin',              '0.2',            'OPEX margin on partner cost',      'Client unit price = ROUND(cost × (1 + margin), 2).', 7),
  ('quote_validity_days',         '30',             'Quote validity (days)',            'Invoice "valid until" = date + this.', 8),
  ('default_term_months',         '12',             'Contract term (months)',           'Term total = monthly total × term.', 9),
  ('fx_mode',                     '"live_buffer"',  'FX mode',                          '[PLACEHOLDER policy] live | live_buffer | fixed.', 10),
  ('fx_buffer_pct',               '0.03',           'FX buffer',                        '[PLACEHOLDER policy] live_buffer rate = live × (1 + buffer).', 11),
  ('fx_fixed_rate',               '1400',           'Fixed FX rate (₦ per $1)',         'Used in fixed mode and as the last-resort fallback.', 12),
  ('show_partner',                'false',          'Name the partner on the invoice',  'Partner is never named while false.', 13),
  ('partner_choice',              '"Recommended"',  'Partner to quote on',              'Recommended | UniCloud | Unitellas.', 14),
  ('amount_due_mode',             '"first_month"',  'Amount due now',                   '[PLACEHOLDER policy] first_month | term | deposit_pct.', 15),
  ('deposit_pct',                 '0.5',            'Deposit (when amount due = deposit_pct)', '[PLACEHOLDER policy] share of the term total.', 16)
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- rate_cards: list rates per service. null = not offered by that partner ("To be quoted").
-- ---------------------------------------------------------------------------
create table if not exists public.rate_cards (
  key                 text primary key,
  service             text not null,
  unicloud_unit       text,
  unicloud_list_ngn   numeric,
  unitellas_unit      text,
  unitellas_list_usd  numeric,
  sort                int not null default 0,
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- unitellas_sizes / unitellas_wan
-- ---------------------------------------------------------------------------
create table if not exists public.unitellas_sizes (
  id                uuid primary key default gen_random_uuid(),
  vcpu              int not null check (vcpu > 0),
  ram_gb            numeric not null check (ram_gb > 0),
  size_name         text not null unique,
  linux_usd_hour    numeric,
  windows_usd_hour  numeric,
  sort              int not null default 0,
  updated_at        timestamptz not null default now()
);

create table if not exists public.unitellas_wan (
  id              uuid primary key default gen_random_uuid(),
  mbps            numeric not null unique check (mbps > 0),
  list_usd_month  numeric not null,
  sort            int not null default 0,
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- fx_rates: every fetch attempt (ok = false rows keep the error)
-- ---------------------------------------------------------------------------
create table if not exists public.fx_rates (
  id          bigint generated always as identity primary key,
  base        text not null default 'USD',
  quote       text not null default 'NGN',
  rate        numeric,
  source      text not null,
  source_time timestamptz,
  ok          boolean not null default true,
  error       text,
  fetched_at  timestamptz not null default now()
);
create index if not exists fx_rates_ok_fetched_idx on public.fx_rates (ok, fetched_at desc);

-- ---------------------------------------------------------------------------
-- pricing_audit: every admin change
-- ---------------------------------------------------------------------------
create table if not exists public.pricing_audit (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor       text not null,
  table_name  text not null,
  row_key     text not null,
  action      text not null default 'update' check (action in ('insert', 'update', 'delete')),
  old_value   jsonb,
  new_value   jsonb
);
create index if not exists pricing_audit_at_idx on public.pricing_audit (at desc);

-- ---------------------------------------------------------------------------
-- invoices: one row per version. Exactly one 'current' per project.
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  number           text not null,
  version          int not null,
  status           text not null default 'current' check (status in ('current', 'superseded')),
  fx_rate_used     numeric not null,
  fx_source        text not null,
  chosen_partner   text not null,
  line_items       jsonb not null,           -- client lines (what the client sees)
  comparison       jsonb not null,           -- internal partner comparison (never sent to the client)
  subtotal         numeric not null,
  vat              numeric not null,
  monthly_total    numeric not null,
  term_months      int not null,
  term_total       numeric,
  amount_due_now   numeric not null,
  amount_due_mode  text not null,
  inputs_hash      text not null,            -- hash of the engine inputs; a change => new version
  inputs_snapshot  jsonb not null,           -- engine inputs + assumptions + settings used
  valid_until      date not null,
  created_reason   text not null default 'save',
  created_at       timestamptz not null default now(),
  downloaded_at    timestamptz,
  download_count   int not null default 0,
  unique (project_id, version)
);
create unique index if not exists invoices_one_current_per_project on public.invoices (project_id) where status = 'current';
create index if not exists invoices_number_idx on public.invoices (number);

-- Invoice number OPX-YYMMDD-NNN, NNN = running count per day (Africa/Lagos).
create table if not exists public.invoice_counters (
  day  text primary key,
  n    int not null default 0
);

create or replace function public.next_invoice_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  d text := to_char(now() at time zone 'Africa/Lagos', 'YYMMDD');
  k int;
begin
  insert into public.invoice_counters (day, n) values (d, 1)
  on conflict (day) do update set n = public.invoice_counters.n + 1
  returning n into k;
  return 'OPX-' || d || '-' || lpad(k::text, 3, '0');
end;
$$;
revoke all on function public.next_invoice_number() from public, anon, authenticated;
grant execute on function public.next_invoice_number() to service_role;

-- ---------------------------------------------------------------------------
-- notifications: email outbox (every attempt and its outcome)
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  kind         text not null,                -- 'invoice_download'
  project_id   uuid references public.projects(id) on delete cascade,
  invoice_id   uuid references public.invoices(id) on delete cascade,
  to_address   text,
  subject      text,
  status       text not null check (status in ('pending', 'sent', 'failed', 'skipped_no_provider', 'debounced')),
  error        text,
  provider_id  text,
  sent_at      timestamptz
);
create index if not exists notifications_invoice_idx on public.notifications (invoice_id, created_at desc);

-- ---------------------------------------------------------------------------
-- admin_login_attempts: rate limiting for /admin
-- ---------------------------------------------------------------------------
create table if not exists public.admin_login_attempts (
  id      bigint generated always as identity primary key,
  ip      text not null,
  ok      boolean not null,
  at      timestamptz not null default now()
);
create index if not exists admin_login_attempts_ip_at_idx on public.admin_login_attempts (ip, at desc);

-- ---------------------------------------------------------------------------
-- RLS: on, no policies => service role only
-- ---------------------------------------------------------------------------
alter table public.pricing_settings      enable row level security;
alter table public.rate_cards            enable row level security;
alter table public.unitellas_sizes       enable row level security;
alter table public.unitellas_wan         enable row level security;
alter table public.fx_rates              enable row level security;
alter table public.pricing_audit         enable row level security;
alter table public.invoices              enable row level security;
alter table public.invoice_counters      enable row level security;
alter table public.notifications         enable row level security;
alter table public.admin_login_attempts  enable row level security;

revoke all on public.pricing_settings, public.rate_cards, public.unitellas_sizes, public.unitellas_wan,
  public.fx_rates, public.pricing_audit, public.invoices, public.invoice_counters, public.notifications,
  public.admin_login_attempts
  from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Seed: values from the Google Sheet "OPEX_Cloud_Quote_Builder" (6 Nov 2026). Idempotent.
-- ---------------------------------------------------------------------------
insert into public.rate_cards (key, service, unicloud_unit, unicloud_list_ngn, unitellas_unit, unitellas_list_usd, sort) values
  ('vcpu', 'vCPU', 'per vCPU / month', 4700, 'n/a: priced through server sizes', null, 1),
  ('ram', 'RAM', 'per GB / month', 4850, 'n/a: priced through server sizes', null, 2),
  ('ssd', 'NVMe / SSD block storage', 'per GB / month', 200, 'per TB / month', 160, 3),
  ('hdd', 'HDD block storage', 'per GB / month (blank = SSD rate)', null, 'per TB / month', 80, 4),
  ('object', 'S3-compatible object storage', 'per GB / month', 100, 'per TB / month', 40, 5),
  ('windows_licence', 'Windows Server licence', 'per Windows server / month (blank = quoted separately)', null, 'n/a: included in Windows sizes', null, 6),
  ('public_ip', 'Static public IPv4', 'per IP / month', 2500, 'per IP / month', null, 7),
  ('internet', 'Internet access', 'per site / month, burstable to 100 Mbps, unmetered', 20000, 'n/a: see WAN tiers', null, 8),
  ('vpn', 'VPN appliance (2 vCPU, 4 GB)', 'per appliance / month', 25100, 'per appliance / month', null, 9),
  ('firewall', 'pfSense firewall', 'per instance / month', 25515, 'per instance / month', null, 10),
  ('load_balancer', 'Load balancer (2 vCPU, 4 GB)', 'per appliance / month', 28800, 'per appliance / month', null, 11),
  ('monitoring', 'Monitoring', 'per agreed service / month', 12000, 'per service / month', null, 12),
  ('backup', 'Managed VM backup', 'per protected VM / month', 41666.67, 'per protected VM / month', null, 13),
  ('replication_ap', 'Active-passive replication', 'per protected VM / month', 91439.91, 'per protected VM / month', null, 14),
  ('replication_aa', 'Active-active replication', 'per protected VM / month', 274319.74, 'per protected VM / month', null, 15)
on conflict (key) do nothing;

insert into public.unitellas_sizes (vcpu, ram_gb, size_name, linux_usd_hour, windows_usd_hour, sort) values
  (1, 4, 'Z4 Medium', 0.05, 0.14, 1),
  (2, 8, 'Z4 Large', 0.1, 0.28, 2),
  (4, 16, 'Z4 Xlarge', 0.2, 0.56, 3),
  (6, 24, 'Z4 3large', 0.3, 0.84, 4),
  (8, 16, 'z4.2xlarge', 0.34, 1.06, 5),
  (8, 32, 'Z4 2xlarge', 0.4, 1.12, 6),
  (10, 40, 'Z4 5large', 0.5, 1.4, 7),
  (12, 48, 'Z4 3xlarge', 0.6, 1.68, 8),
  (14, 56, 'Z4 7large', 0.7, 1.96, 9),
  (16, 64, 'Z4 4xlarge', 0.8, 2.24, 10),
  (18, 72, 'Z4 9large', 0.9, 2.52, 11),
  (20, 80, 'Z4 5xlarge', 1, 2.8, 12),
  (22, 88, 'Z4 11large', 1.1, 3.08, 13),
  (24, 96, 'Z4 6xlarge', 1.2, 3.36, 14),
  (26, 104, 'Z4 13large', 1.3, 3.64, 15),
  (28, 112, 'Z4 7xlarge', 1.4, 3.92, 16),
  (30, 120, 'Z4 15large', 1.5, 4.2, 17),
  (34, 136, 'Z4 17large', 1.7, 4.76, 18),
  (36, 144, 'Z4 9xlarge', 1.8, 5.04, 19),
  (38, 152, 'Z4 19large', 1.9, 5.32, 20),
  (40, 160, 'Z4 10xlarge', 2, 5.6, 21),
  (42, 168, 'Z4 21large', 2.1, 5.88, 22),
  (44, 176, 'Z4 11xlarge', 2.2, 6.16, 23),
  (46, 184, 'Z4 23large', 2.3, 6.44, 24),
  (48, 192, 'Z4 12xlarge', 2.4, 6.72, 25)
on conflict (size_name) do nothing;

insert into public.unitellas_wan (mbps, list_usd_month, sort) values
  (100, 200, 1),
  (200, 400, 2),
  (1000, 1500, 3),
  (10000, 10000, 4)
on conflict (mbps) do nothing;

-- Initial FX record so pricing works before the first cron run (rate returned by open.er-api.com on 6 Nov 2026).
insert into public.fx_rates (rate, source, ok, fetched_at)
select 1348.02, 'open.er-api.com (seed)', true, now() - interval '25 hours'
where not exists (select 1 from public.fx_rates);

-- A version is "issued" once the client downloads its PDF or submits. Issued versions are never changed:
-- a later change to the priced content creates a new version. Un-issued current versions are updated in place.
alter table public.invoices add column if not exists issued_at timestamptz;

-- Hash of answers + servers, so navigation-only saves don't rewrite rows or flip a submitted project to 'edited'.
alter table public.requirements add column if not exists content_hash text;
