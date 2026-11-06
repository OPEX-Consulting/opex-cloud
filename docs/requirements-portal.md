# Client requirements portal

A private, unlisted questionnaire for clients who have **already signed** with OPEX Cloud (migration / DR sizing).
It replaces the "Opex_Cloud_Data_Gathering_Questionnaire" Google Sheet.

- Portal: `/requirements/<token>` (noindex, not linked from the navbar)
- Demo: `/requirements/demo` – fully clickable, saves to the browser only
- Admin: `/admin` (password login, noindex, not linked anywhere) – pricing, client links, answers and invoices
- API (server-side only):
  - `GET  /api/requirements/<token>` – load project (public fields only), saved answers and servers
  - `PUT  /api/requirements/<token>/draft` – autosave a partial draft (also accepts `POST` for `sendBeacon`); re-prices the
    invoice once one exists
  - `POST /api/requirements/<token>/submit` – validate required items, save, mark `submitted` / `resubmitted`, issue the invoice
  - `GET  /api/requirements/<token>/invoice` – current pro-forma invoice (client-safe JSON; creates v1 if needed)
  - `POST /api/requirements/<token>/invoice/preview` – price a draft without saving (demo links)
  - `GET  /api/requirements/<token>/invoice.pdf` – current version as an A4 PDF; emails OPEX (after the response)
  - `GET  /api/cron/fx` – daily USD→NGN refresh (Vercel cron, `Authorization: Bearer $CRON_SECRET`)

## Environment variables

Set in Vercel (Production + Preview) and in `.env.local` for local development:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key. **Server only** – never prefix with `NEXT_PUBLIC_`. |
| `ADMIN_PASSWORD` | Password for `/admin`. Changing it signs everyone out. Set (random) in Vercel. |
| `CRON_SECRET` | Protects `/api/cron/fx`; Vercel cron sends it automatically. Set (random) in Vercel. |
| `RESEND_API_KEY` | Optional. Without it, download emails are recorded in `notifications` as `skipped_no_provider` and the PDF is still served. |
| `INVOICE_ALERT_TO` | Optional. Who gets the "invoice downloaded" email. Default `[PLACEHOLDER] finance@opexconsult.co.uk` (the address inside is used). |
| `INVOICE_FROM` | Optional. Sender, e.g. `OPEX Cloud <billing@your-verified-domain>`. Default `OPEX Cloud <onboarding@resend.dev>` (Resend test sender: only delivers to the Resend account owner). |

If either variable is missing, the portal runs in **demo mode** for every token (fake "Demo Client Ltd" project,
answers saved to `localStorage` only). The token `demo` is always demo mode.

## Database

Schema: `supabase/migrations/0001_requirements_portal.sql` and `0002_pricing_invoices.sql`

- `projects` – one row per client engagement. `token` (random 48-hex) is the private link. Internal team fields
  (`project_manager`, `lead_engineer`, `deployment_engineer`) are never selected by the portal.
- `requirements` – answers for steps 1–4 and inventory flags (`answers` jsonb) and `current_step`.
- `servers` – one row per server (`kind` = `linux` | `windows` | `physical`). For physical servers `vcpu` holds CPU
  cores. `disks` is a JSON array of extra-disk sizes in GiB. `details` (jsonb) holds `osOther`, `osType`,
  `roleOther`, `hypervisorOther`.
- `pricing_settings` (key/value), `rate_cards`, `unitellas_sizes`, `unitellas_wan` – the pricing data that replaced the
  "OPEX_Cloud_Quote_Builder" Google Sheet (seeded with the sheet's values of 6 Nov 2026). Edit at `/admin/pricing`.
- `fx_rates` – every USD→NGN fetch (ok or failed). `pricing_audit` – every admin change (who, when, table, old, new).
- `invoices` – one row per version (`current` / `superseded`), with the locked FX rate, chosen partner, client lines,
  internal comparison, totals and an inputs snapshot. `invoice_counters` + `next_invoice_number()` give `OPX-YYMMDD-NNN`.
- `notifications` – email outbox (`pending`, `sent`, `failed`, `skipped_no_provider`, `debounced`).
- `admin_login_attempts` – login rate limiting (5 failures per IP / 50 overall per 15 minutes).
- RLS is enabled on every table with **no policies**: only the service role (the Next.js server) can access them.

### Run the migration

With the Supabase CLI (linked project):

```bash
supabase link --project-ref <project-ref>
supabase db push            # applies supabase/migrations/*
psql "$DATABASE_URL" -f supabase/seed.sql   # optional test project
```

Or paste the migration into the Supabase dashboard → SQL editor and run it. `supabase/seed.sql` creates a test project
reachable at `/requirements/test-token-0123456789abcdef`.

## Create a client link

Use **/admin → Projects → Create a client link** (generates the token, sets the expiry, shows the link to send).
The SQL below still works:

```sql
insert into public.projects (
  customer_name, project_name, customer_address,
  opex_sales_contact_name, opex_sales_contact_email, opex_sales_contact_phone,
  project_manager, lead_engineer, deployment_engineer,
  expires_at
) values (
  'Acme Bank Plc', 'Core banking DR', '12 Marina, Lagos',
  'Jane Doe', 'jane.doe@opexconsult.co.uk', '+234 800 000 0000',
  'PM name', 'Lead engineer', 'Deployment engineer',
  now() + interval '30 days'
)
returning token;
```

Send the client: `https://opex-cloud.vercel.app/requirements/<token>`

- Status moves `invited` → `in_progress` (first autosave) → `submitted`. Clients can reopen and edit after submitting:
  the first real change sets `edited`, and submitting again sets `resubmitted`. Mark `reviewed` in /admin (a later
  client edit moves it back to `edited`). Navigation alone never changes the status (answers are hashed).
- Expired links (`expires_at` in the past) show a friendly "link expired" screen. Extend with
  `update projects set expires_at = now() + interval '14 days' where token = '…';`
- Submitted questionnaires no longer need reopening: the client can edit at any time while the link is open.

## Reading the answers

```sql
select p.customer_name, r.answers, r.updated_at
from projects p join requirements r on r.project_id = p.id
where p.token = '…';

select kind, count(*), sum(vcpu) as cpu, sum(ram_gib) as ram_gib,
       sum(boot_gib + coalesce((select sum(value::numeric) from jsonb_array_elements_text(disks)), 0)) as storage_gib,
       sum(public_ips) as public_ips
from servers where project_id = (select id from projects where token = '…')
group by kind;
```

## Code map

- `src/app/requirements/[token]/page.tsx` – server component, loads the project and renders the portal
- `src/app/requirements/_components/` – `Portal` (screens, autosave, navigation), `Steps` (steps 1–4),
  `Inventory` (step 5), `Summary` (review / read-only / print), `ui` (form primitives)
- `src/lib/requirements/options.ts` – every option list from the sheet (updated as agreed in review)
- `src/lib/requirements/schema.ts` – zod schemas shared by client and API
- `src/lib/requirements/logic.ts` – required-field rules, totals
- `src/lib/requirements/csv.ts` – CSV template / parser for server import
- `src/lib/requirements/server.ts` – Supabase access (server only)
- `src/lib/pricing/` – `engine.ts` (pure sheet engine), `fromRequirements.ts`, `policy.ts` (assumption defaults),
  `defaults.ts` (sheet seed values), `data.ts` (load from Supabase), `fx.ts`
- `src/lib/invoice/` – `company.ts` (all invoice placeholders), `service.ts` (versions), `view.ts`, `pdf.ts`, `email.ts`
- `src/app/requirements/_components/InvoiceStep.tsx` – step 7
- `src/app/admin/` and `src/app/api/admin/` – admin pages and form handlers; `src/lib/admin/auth.ts` – session and audit
- `scripts/sample-invoice.ts` – render a sample PDF locally: `npx tsx scripts/sample-invoice.ts out.pdf`

## Pricing and invoices (Phase 2)

Flow: answers → `src/lib/pricing/fromRequirements.ts` (engine inputs) → `src/lib/pricing/engine.ts` (pure, reproduces the
sheet's Comparison and Client Quote tabs exactly; unit tests in `src/lib/pricing/*.test.ts`, run `npm test`) →
`src/lib/invoice/service.ts` (versions) → `src/lib/invoice/pdf.ts` (pdf-lib, A4) → `src/lib/invoice/email.ts` (Resend).

- **Server rows**: Linux, Windows and physical servers (physical: CPU cores = vCPU; Windows when the OS is a Windows
  Server edition). Identical rows are grouped with a quantity. Storage = boot + extra disks, split by the storage tier
  (SSD, HDD, or SSD boot + HDD data). Per-server managed backup and replication (bulk "apply to all" in step 5).
- **Services** (step 4): object storage GB, static public IPs, internet sites, bandwidth, VPN, firewalls, load balancers,
  monitoring, standby compute at a secondary site.
- **Not sure / blank** answers are priced on the defaults in `src/lib/pricing/policy.ts` and the lines are flagged
  "Assumed" on the invoice and PDF. A DR use case pre-selects Active-passive replication.
- **Recommendation**: a partner covering everything wins; else the one with at least 2 fewer gaps; else the cheaper like
  for like. `partner_choice` can force a partner. The partner is never named while `show_partner` is false.
- **Client price** = ROUND(partner cost × (1 + margin), 2). "To be quoted" lines are listed but excluded from totals.
- **Versions**: the client-derived inputs and bill-to details are hashed. No change → nothing happens (prices and FX
  stay locked). A change re-prices the current version in place while it has not been *issued*; once issued (PDF
  downloaded or requirements submitted) a change creates a new version and the old one becomes `superseded`.
  Admin rate changes therefore apply to the next newly priced version, never to an issued one.
- **FX**: daily cron (05:15 UTC) plus an on-demand fetch when the latest rate is older than 26 h. Failures fall back to
  the last good rate, then `fx_fixed_rate`. Effective rate = live, live × (1 + `fx_buffer_pct`), or fixed (`fx_mode`).
  Each invoice stores the rate and its source.
- **Download email**: each PDF download emails OPEX with the PDF, client, number/version, amount due and what changed
  from the previous version. Repeated downloads of the same version within 10 minutes send one email.

## Placeholders to replace

Everything below is an obvious placeholder (`[PLACEHOLDER…]`) or a placeholder business policy. Replace before real use.

| What | Where | How to replace |
| --- | --- | --- |
| Logo (text "OPEX Cloud" + "[PLACEHOLDER: logo]") | `src/lib/invoice/company.ts` → `COMPANY.logoText`; drawing in `src/lib/invoice/pdf.ts` (header band) | Edit the text, or embed a PNG with `doc.embedPng` in the header |
| Registered address, billing email, billing phone | `src/lib/invoice/company.ts` → `COMPANY.address/email/phone` | Edit and deploy |
| RC number, TIN, VAT number | `src/lib/invoice/company.ts` → `COMPANY.rcNumber/tin/vatNumber` | Edit and deploy |
| Bank name, account name, account number, sort code, payment terms | `src/lib/invoice/company.ts` → `PAYMENT` | Edit and deploy |
| Legal footer ("not a tax invoice…") | `src/lib/invoice/company.ts` → `INVOICE_TEXT.legalFooter` | Edit and deploy |
| Invoice number format `OPX-YYMMDD-NNN` | `next_invoice_number()` in `0002_pricing_invoices.sql` | Replace the SQL function |
| Amount due now (first month incl. VAT) | `pricing_settings.amount_due_mode` (`first_month` / `term` / `deposit_pct`) and `deposit_pct` | /admin → Pricing → Settings |
| FX policy (live + 3 % buffer) | `pricing_settings.fx_mode`, `fx_buffer_pct`, `fx_fixed_rate` | /admin → Pricing → Settings |
| Defaults for "Not sure" answers (2 vCPU / 4 GB / 50 GB, backup Yes, replication by use case, SSD, 500 GB object if Object ticked, ≥1 IP, 1 site, 100 Mbps, 1 VPN, 1 firewall, 0 LB, 1 monitoring, standby No) | `src/lib/pricing/policy.ts` | Edit and deploy |
| Download alert recipient / sender | env `INVOICE_ALERT_TO`, `INVOICE_FROM` (defaults in `src/lib/invoice/company.ts` → `EMAIL`) | Set in Vercel; verify the sender domain in Resend |
| Email provider key | env `RESEND_API_KEY` (not set) | Create a Resend API key and set it in Vercel |
| OPEX data-centre list | `OPEX_DATA_CENTRES` in `src/lib/requirements/options.ts` (empty) | Add the confirmed sites |

Rate cards, Unitellas sizes and WAN tiers are real values from the sheet; change them at /admin → Pricing (audited).

## TODO

- `OPEX_DATA_CENTRES` in `src/lib/requirements/options.ts` is intentionally empty – add the confirmed OPEX Cloud
  data-centre sites. While empty, the data-centre question is hidden.
- Notify the OPEX team on submit (email/Slack webhook) – only PDF downloads email OPEX today.
- Payment collection (the invoice is a pro-forma; no payment gateway).
