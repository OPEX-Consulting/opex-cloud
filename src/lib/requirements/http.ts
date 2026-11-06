import { NextResponse } from "next/server";
import { tokenSchema } from "./schema";

export const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

export function checkToken(token: string) {
  return tokenSchema.safeParse(token).success;
}

const MAX_BODY = 4_000_000; // ~4 MB

export async function readJson(request: Request): Promise<unknown | undefined> {
  const text = await request.text();
  if (text.length > MAX_BODY) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
