import { requireAdmin } from "@/lib/admin/auth";
import { getConnection, listOrganizations } from "@/lib/zoho/client";
import { AdminShell, Card, Flash, btn, btnLight, input, when, type SP } from "../_ui";

export const dynamic = "force-dynamic";

const DC: Record<string, string> = {
  "accounts.zoho.com": "US",
  "accounts.zoho.eu": "EU",
  "accounts.zoho.in": "India",
  "accounts.zoho.com.au": "Australia",
  "accounts.zoho.jp": "Japan",
  "accounts.zoho.ca": "Canada",
  "accounts.zoho.sa": "Saudi Arabia",
  "accounts.zoho.uk": "UK",
  "accounts.zohocloud.ca": "Canada",
};

function dataCentre(accounts: string | null | undefined) {
  if (!accounts) return "—";
  try {
    const host = new URL(accounts).hostname;
    return DC[host] ? `${DC[host]} (${host})` : host;
  } catch {
    return accounts;
  }
}

export default async function Zoho({ searchParams }: { searchParams: SP }) {
  await requireAdmin();
  const configured = Boolean(process.env.ZOHO_CLIENT_ID);
  const conn = await getConnection().catch(() => null);

  let orgs: { organization_id: string; name: string }[] = [];
  let orgErr = "";
  if (conn && !conn.org_id) {
    try {
      orgs = await listOrganizations();
    } catch (e) {
      orgErr = e instanceof Error ? e.message : "Could not load organisations.";
    }
  }

  return (
    <AdminShell active="zoho">
      <Flash searchParams={searchParams} />
      <p className="mb-5 text-sm text-secondary">
        Invoices are created in Zoho Books as open invoices on the client&apos;s first PDF download of each version.
      </p>

      <Card
        title="Zoho Books connection"
        right={
          conn ? (
            <form action="/api/admin/zoho/disconnect" method="post">
              <button className={btnLight}>Disconnect</button>
            </form>
          ) : null
        }
      >
        {!configured && (
          <p className="mb-3 rounded-xl bg-[#fdf1ec] px-4 py-2.5 text-sm font-medium text-[#8a3a17]">
            ZOHO_CLIENT_ID is not set on the server, so Zoho cannot be connected yet.
          </p>
        )}
        <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5 text-sm">
          <dt className="text-muted">Status</dt>
          <dd>
            <b className={conn ? "text-[#15803d]" : "text-[#8a3a17]"}>{conn ? "Connected" : "Not connected"}</b>
          </dd>
          {conn && (
            <>
              <dt className="text-muted">Organisation</dt>
              <dd>{conn.org_name ? `${conn.org_name} (${conn.org_id})` : conn.org_id || "Not chosen yet"}</dd>
              <dt className="text-muted">Data centre</dt>
              <dd>{dataCentre(conn.accounts_server)}</dd>
              <dt className="text-muted">API domain</dt>
              <dd>{conn.api_domain || "—"}</dd>
              <dt className="text-muted">Connected</dt>
              <dd>{when(conn.connected_at)}</dd>
            </>
          )}
        </dl>
        <form action="/api/admin/zoho/connect" method="post" className="mt-4">
          <button className={conn ? btnLight : btn} disabled={!configured}>
            {conn ? "Reconnect" : "Connect Zoho Books"}
          </button>
        </form>
      </Card>

      {conn && !conn.org_id && (
        <Card title="Choose organisation">
          {orgErr ? (
            <p className="text-sm text-[#8a3a17]">{orgErr}</p>
          ) : orgs.length === 0 ? (
            <p className="text-sm text-secondary">No Zoho Books organisations were found for this account.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {orgs.map((o) => (
                <form key={o.organization_id} action="/api/admin/zoho/org" method="post" className="flex items-center gap-3">
                  <input type="hidden" name="org_id" value={o.organization_id} />
                  <input type="hidden" name="org_name" value={o.name} />
                  <span className={`${input} flex items-center`}>
                    {o.name} <span className="ml-2 text-xs text-muted">{o.organization_id}</span>
                  </span>
                  <button className={btn}>Use this</button>
                </form>
              ))}
            </div>
          )}
        </Card>
      )}
    </AdminShell>
  );
}
