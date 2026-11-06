import { isDemo, submitDraft } from "@/lib/requirements/server";
import { checkToken, json, readJson } from "@/lib/requirements/http";
import { draftSchema } from "@/lib/requirements/schema";
import { findMissing } from "@/lib/requirements/logic";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Submission: validates required items, saves, marks submitted/resubmitted and issues the current invoice version. */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!checkToken(token)) return json({ success: false, message: "This link is not recognised." }, 404);

  const body = await readJson(req);
  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) {
    return json({ success: false, message: "Some answers are not in the expected format.", issues: parsed.error.issues.slice(0, 10) }, 400);
  }
  const missing = findMissing(parsed.data.answers, parsed.data.servers);
  if (missing.length) {
    return json({ success: false, message: "A few required items are still missing.", missing }, 422);
  }
  if (isDemo(token)) return json({ success: true, demo: true, submittedAt: new Date().toISOString() });

  try {
    const result = await submitDraft(token, parsed.data);
    if (!result.ok) return json({ success: false, message: result.message }, result.status);
    return json({ success: true, submittedAt: result.updatedAt, status: result.status, invoice: result.invoice });
  } catch (error) {
    console.error("[requirements] submit failed", error);
    return json({ success: false, message: "We couldn't submit just now. Your answers are saved – please try again shortly." }, 500);
  }
}
