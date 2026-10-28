import { NextResponse } from "next/server";

export const runtime = "nodejs";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbySuxgVKFW-poz1QdJXRbISkbprrlmK51w3j_f1g6ZPygzhLd8R-kL0ZEBtiCaMFKBMWw/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      redirect: "follow",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Google Apps Script returned HTTP ${response.status}.`);
    }

    const result = await response.json();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Submission failed.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your onboarding details were saved successfully.",
    });
  } catch (error) {
    console.error("Google Sheets onboarding error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "We couldn't save your details. Please try again later.",
      },
      { status: 502 }
    );
  }
}
