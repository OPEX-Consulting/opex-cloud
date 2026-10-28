import { NextResponse } from "next/server";

const SUPPORT_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxyedZ_lo8R31aqKT7aRfW6-0dcnS5vtmH6T2dMgjn7BR1jqsvnwEQUD0NF1StHXPPo8A/exec";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(SUPPORT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "We couldn't submit your request. Please try again.",
        },
        { status: 502 }
      );
    }

    const result = await response.json();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Unable to submit your support request.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        result.message ||
        "Your support request has been submitted successfully.",
      ticketId: result.ticketId || "",
    });
  } catch (error) {
    console.error("Support API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "We couldn't process your request right now. Please try again later.",
      },
      { status: 500 }
    );
  }
}
