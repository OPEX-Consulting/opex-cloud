-- Separate Zoho connections for production (id 1) and preview/development (id 2), and record which
-- Zoho organisation each invoice was created in, so a test-org invoice is never reused or voided in live books.
alter table zoho_connection drop constraint if exists zoho_connection_id_check;
alter table zoho_connection add constraint zoho_connection_id_check check (id in (1, 2));
alter table invoices add column if not exists zoho_org_id text;
