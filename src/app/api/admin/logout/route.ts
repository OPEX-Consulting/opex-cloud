import { ADMIN_COOKIE } from "@/lib/admin/auth";
import { back } from "@/lib/admin/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const res = back(req, "/admin", { ok: "Signed out." });
  res.cookies.set({ name: ADMIN_COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
}
