# Client requirements portal

A private, unlisted questionnaire for clients who have **already signed** with OPEX Cloud (migration / DR sizing).
It replaces the "Opex_Cloud_Data_Gathering_Questionnaire" Google Sheet.

- Portal: `/requirements/<token>` (noindex, not linked from the navbar)
- Demo: `/requirements/demo` – fully clickable, saves to the browser only
- API (server-side only):
  - `GET  /api/requirements/<token>` – load project (public fields only), saved answers and servers
  - `PUT  /api/requirements/<token>/draft` – autosave a partial draft (also accepts `POST` for `sendBeacon`)
  - `POST /api/requirements/<token>/submit` – validate required items, save, lock (`status = 'submitted'`)

## Environment variables

Set in Vercel (Production + Preview) and in `.env.local` for local development:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Supabase project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key. **Server only** – never prefix with `NEXT_PUBLIC_`. |

If either variable is missing, the portal runs in **demo mode** for every token (fake "Demo Client Ltd" project,
answers saved to `localStorage` only). The token `demo` is always demo mode.

## Database

Schema: `supabase/migrations/0001_requirements_portal.sql`

- `projects` – one row per client engagement. `token` (random 48-hex) is the private link. Internal team fields
  (`project_manager`, `lead_engineer`, `deployment_engineer`) are never selected by the portal.
- `requirements` – answers for steps 1–4 and inventory flags (`answers` jsonb) and `current_step`.
- `servers` – one row per server (`kind` = `linux` | `windows` | `physical`). For physical servers `vcpu` holds CPU
  cores. `disks` is a JSON array of extra-disk sizes in GiB. `details` (jsonb) holds `osOther`, `osType`,
  `roleOther`, `hypervisorOther`.
- RLS is enabled on all three tables with **no policies**: only the service role (the Next.js server) can access them.

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

In the SQL editor:

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

- Status moves `invited` → `in_progress` (first autosave) → `submitted` (client submits; link becomes read-only).
  Set `reviewed` once the team has worked through it.
- Expired links (`expires_at` in the past) show a friendly "link expired" screen. Extend with
  `update projects set expires_at = now() + interval '14 days' where token = '…';`
- To reopen a submitted questionnaire: `update projects set status = 'in_progress', submitted_at = null where token = '…';`

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

## TODO

- `OPEX_DATA_CENTRES` in `src/lib/requirements/options.ts` is intentionally empty – add the confirmed OPEX Cloud
  data-centre sites. While empty, the data-centre question is hidden.
- Notify the OPEX team on submit (email/Slack webhook) – not implemented yet.
- An internal admin view to create links and read submissions – use SQL for now.
