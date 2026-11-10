import Link from "next/link";
import type { ReactNode } from "react";

export const input =
  "h-9 w-full rounded-lg border border-[#dfe3ea] bg-white px-2.5 text-sm outline-none focus:border-opex-blue focus:ring-2 focus:ring-opex-blue/15";
export const btn = "inline-flex h-9 items-center justify-center rounded-lg bg-opex-navy px-3.5 text-sm font-semibold text-white hover:bg-opex-navy-light";
export const btnLight = "inline-flex h-9 items-center justify-center rounded-lg border border-[#dfe3ea] bg-white px-3 text-sm font-semibold hover:border-[#c5cedb]";

export type SP = Promise<Record<string, string | string[] | undefined>>;

export async function Flash({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ok = typeof sp.ok === "string" ? sp.ok : "";
  const err = typeof sp.err === "string" ? sp.err : "";
  if (!ok && !err) return null;
  return (
    <p
      role={err ? "alert" : "status"}
      className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-medium ${err ? "bg-[#fdf1ec] text-[#8a3a17]" : "bg-[#eaf7ef] text-[#15803d]"}`}
    >
      {err || ok}
    </p>
  );
}

export function AdminShell({ active, children }: { active: "projects" | "pricing" | "zoho"; children: ReactNode }) {
  const tab = (href: string, label: string, on: boolean) => (
    <Link href={href} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${on ? "bg-white/15 text-white" : "text-white/70 hover:text-white"}`}>
      {label}
    </Link>
  );
  return (
    <>
      <header className="bg-opex-navy">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-white">OPEX Cloud · Admin</span>
            <nav className="flex gap-1">
              {tab("/admin/projects", "Projects", active === "projects")}
              {tab("/admin/pricing", "Pricing", active === "pricing")}
              {tab("/admin/zoho", "Zoho Books", active === "zoho")}
            </nav>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="text-sm font-semibold text-white/70 hover:text-white">Sign out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}

export function Card({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-[#e3e7ee] bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export const ngn = (n: number | null | undefined) =>
  n == null ? "—" : `₦${Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const when = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Lagos" }) : "—";
