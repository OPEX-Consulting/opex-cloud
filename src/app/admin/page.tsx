import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin/auth";
import { Flash, btn, input, type SP } from "./_ui";

export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: SP }) {
  if (await isAdmin()) redirect("/admin/projects");
  return (
    <main className="mx-auto max-w-sm px-4 py-24">
      <h1 className="text-xl font-bold">OPEX Cloud admin</h1>
      <p className="mt-1 text-sm text-secondary">Pricing, client links and invoices.</p>
      <div className="mt-6">
        <Flash searchParams={searchParams} />
        <form action="/api/admin/login" method="post" className="grid gap-3 rounded-2xl border border-[#e3e7ee] bg-white p-5">
          <label className="grid gap-1 text-sm font-semibold">
            Password
            <input name="password" type="password" required autoComplete="current-password" className={input} />
          </label>
          <button className={btn}>Sign in</button>
        </form>
      </div>
    </main>
  );
}
