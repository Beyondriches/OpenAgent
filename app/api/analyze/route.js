import { NextResponse } from "next/server";

const COINS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  XRP: "ripple",
  SOL: "solana",
  BNB: "binancecoin",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  DOT: "polkadot",
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "0.3",
    endpoint: "/api/analyze",
    marketData: "CoinGecko",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const symbol = String(body?.symbol || "ETH")
      .trim()
      .toUpperCase();

    const timeframe = String(body?.timeframe || "swing").trim();

    const coinId = COINS[symbol];

    if (!coinId) {
      return NextResponse.json(
        {
          ok: false,
          error: `${symbol} is not supported yet.`,
        },
        { status: 400 }
      );
    }

    const url =
      `https://api.coingecko.com/api/v3/coins/markets` +
      `?vs_currency=usd&ids=${coinId}` +
      `&price_change_percentage=24h`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }

    const data = await response.json();
    const coin = data[0];

    if (!coin) {
      throw new Error("No market data returned.");
    }

    return NextResponse.json({
      ok: true,
      symbol,
      timeframe,
      live: true,
      source: "CoinGecko",
      market: {
        name: coin.name,
        priceUSD: coin.current_price,
        change24h: coin.price_change_percentage_24h,
        volume24hUSD: coin.total_volume,
        marketCapUSD: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
      },
      summary:
        `${symbol} live market data loaded successfully for ${timeframe} analysis.`,
      framework: [
        "Live market data is active.",
        "Keep core capital separate from speculative trading capital.",
        "Define risk and invalidation before entering a trade.",
        "Avoid FOMO entries after sharp price moves.",
      ],
    });
  } catch (error) {
    console.error("Theo analyze error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to retrieve live market data.",
      },
      { status: 500 }
    );
  }
}