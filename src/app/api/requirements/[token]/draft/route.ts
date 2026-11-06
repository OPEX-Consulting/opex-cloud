import { isDemo, saveDraft } from "@/lib/requirements/server";
import { checkToken, json, readJson } from "@/lib/requirements/http";
import { draftSchema } from "@/lib/requirements/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Autosave a partial draft. Accepts incomplete answers; rejects once submitted or expired. */
export async function PUT(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!checkToken(token)) return json({ success: false, message: "This link is not recognised." }, 404);
  if (isDemo(token)) return json({ success: true, demo: true, updatedAt: new Date().toISOString() });

  const body = await readJson(req);
  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, message: "Some answers could not be saved.", issues: parsed.error.issues.slice(0, 10) }, 400);
  }
  try {
    const result = await saveDraft(token, parsed.data);
    if (!result.ok) return json({ success: false, message: result.message }, result.status);
    return json({ success: true, updatedAt: result.updatedAt });
  } catch (error) {
    console.error("[requirements] draft save failed", error);
    return json({ success: false, message: "Saving failed. We'll keep trying." }, 500);
  }
}

export const POST = PUT;
