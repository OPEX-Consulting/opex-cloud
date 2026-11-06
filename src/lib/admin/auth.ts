// Server-only: password login for /admin. Signed httpOnly cookie, DB-backed rate limiting, audit helper.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "../server/db";

export const ADMIN_COOKIE = "opex_admin";
const SESSION_SECONDS = 12 * 60 * 60;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_IP = 5;
const MAX_FAILS_GLOBAL = 50;

function key() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  // Changing ADMIN_PASSWORD invalidates every session.
  return createHash("sha256").update(`opex-admin-session-v1:${pw}`).digest();
}

function sign(payload: string) {
  const k = key();
  if (!k) return null;
  return createHmac("sha256", k).update(payload).digest("base64url");
}

export function makeSession(): string | null {
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const sig = sign(`admin.${exp}`);
  return sig ? `${exp}.${sig}` : null;
}

export function verifySession(value: string | undefined): boolean {
  if (!value) return false;
  const [expS, sig] = value.split(".");
  const exp = Number(expS);
  if (!exp || !sig || exp * 1000 < Date.now()) return false;
  const want = sign(`admin.${exp}`);
  if (!want) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function passwordMatches(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}

export const sessionCookie = (value: string) => ({
  name: ADMIN_COOKIE,
  value,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: SESSION_SECONDS,
});

export function clientIp(h: Headers) {
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}

/** True when this IP (or everyone together) has too many recent failed logins. */
export async function rateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const [mine, all] = await Promise.all([
    db().from("admin_login_attempts").select("id", { count: "exact", head: true }).eq("ip", ip).eq("ok", false).gte("at", since),
    db().from("admin_login_attempts").select("id", { count: "exact", head: true }).eq("ok", false).gte("at", since),
  ]);
  return (mine.count ?? 0) >= MAX_FAILS_PER_IP || (all.count ?? 0) >= MAX_FAILS_GLOBAL;
}

export async function recordAttempt(ip: string, ok: boolean) {
  await db().from("admin_login_attempts").insert({ ip, ok });
}

/** For server components and route handlers: is the request signed in? */
export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return verifySession(c.get(ADMIN_COOKIE)?.value);
}

/** For admin pages: redirect to the login screen when not signed in. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin");
}

export async function actor(): Promise<string> {
  const h = await headers();
  return `admin@${clientIp(h)}`;
}

export async function audit(table: string, rowKey: string, action: "insert" | "update" | "delete", oldValue: unknown, newValue: unknown) {
  const { error } = await db()
    .from("pricing_audit")
    .insert({ actor: await actor(), table_name: table, row_key: rowKey, action, old_value: oldValue ?? null, new_value: newValue ?? null });
  if (error) throw new Error(`audit failed: ${error.message}`);
}
