import { clientIp, makeSession, passwordMatches, rateLimited, recordAttempt, sessionCookie } from "@/lib/admin/auth";
import { back, str } from "@/lib/admin/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.ADMIN_PASSWORD) return back(req, "/admin", { err: "Admin is not configured (ADMIN_PASSWORD is not set)." });
  const ip = clientIp(req.headers);
  if (await rateLimited(ip)) return back(req, "/admin", { err: "Too many attempts. Try again in 15 minutes." });
  const form = await req.formData();
  const ok = passwordMatches(str(form.get("password")));
  await recordAttempt(ip, ok);
  if (!ok) return back(req, "/admin", { err: "That password is not right." });
  const session = makeSession()!;
  const res = back(req, "/admin/projects");
  res.cookies.set(sessionCookie(session));
  return res;
}
