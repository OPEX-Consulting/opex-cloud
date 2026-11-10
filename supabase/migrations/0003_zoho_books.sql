-- Zoho Books integration: single-row OAuth connection + per-invoice sync fields.
create table if not exists zoho_connection (
  id int primary key default 1 check (id = 1),
  refresh_token text,
  accounts_server text,
  api_domain text,
  org_id text,
  org_name text,
  access_token text,
  access_expires_at timestamptz,
  tax_id text,
  connected_at timestamptz default now()
);
alter table zoho_connection enable row level security;
revoke all on zoho_connection from anon, authenticated;

alter table invoices
  add column if not exists zoho_invoice_id text,
  add column if not exists zoho_invoice_number text,
  add column if not exists zoho_total numeric,
  add column if not exists zoho_status text,
  add column if not exists zoho_voided_at timestamptz,
  add column if not exists zoho_sync_error text,
  add column if not exists zoho_synced_at timestamptz;
