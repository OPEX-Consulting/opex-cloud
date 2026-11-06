import { checkToken, json, readJson } from "@/lib/requirements/http";
import { draftSchema } from "@/lib/requirements/schema";
import { getProject, isDemo } from "@/lib/requirements/server";
import { hasPricedContent, priceDraft } from "@/lib/invoice/service";
import { effectiveFx } from "@/lib/pricing/fx";
import { priceQuote } from "@/lib/pricing/engine";
import { INVOICE_TEXT } from "@/lib/invoice/company";
import { addDays, buildInvoiceView } from "@/lib/invoice/view";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Price a draft without saving anything (demo links, and a live preview before autosave lands). */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!checkToken(token)) return json({ success: false, message: "This link is not recognised." }, 404);
  if (!isDemo(token) && !(await getProject(token))) return json({ success: false, message: "This link is not recognised." }, 404);
  const parsed = draftSchema.safeParse(await readJson(req));
  if (!parsed.success) return json({ success: false, message: "Some answers are not in the expected format." }, 400);
  try {
    if (!hasPricedContent(parsed.data)) return json({ success: true, invoice: null });
    const { pricing, mapped, billTo } = await priceDraft(parsed.data);
    const fx = await effectiveFx(pricing.settings);
    const r = priceQuote(mapped.inputs, pricing, fx.rate, INVOICE_TEXT.clientNote);
    const now = new Date().toISOString();
    const invoice = buildInvoiceView({
      id: null,
      number: "PREVIEW",
      version: 0,
      status: "preview",
      createdAt: now,
      validUntil: addDays(now, pricing.settings.quoteValidityDays),
      quote: r.quote,
      chosen: r.comparison.chosen,
      settings: pricing.settings,
      billTo,
    });
    return json({ success: true, invoice, assumptions: mapped.assumptions });
  } catch (error) {
    console.error("[invoice] preview failed", error);
    return json({ success: false, message: "We couldn't price this just now." }, 500);
  }
}
