import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "0.2",
    endpoint: "/api/analyze",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const symbol = String(body?.symbol || "ETH").trim().toUpperCase();
    const timeframe = String(body?.timeframe || "swing").trim();

    return NextResponse.json({
      ok: true,
      symbol,
      timeframe,
      summary:
        `${symbol} is ready for analysis in ${timeframe} mode. ` +
        "This deployment-check version does not yet use live market data.",
      framework: [
        "Separate core capital from speculative trading capital.",
        "Define invalidation and risk before entering a trade.",
        "Avoid FOMO entries after sharp moves.",
        "Add live market-data and signal integrations only after the base deployment is stable."
      ],
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON request body." },
      { status: 400 }
    );
  }
}
