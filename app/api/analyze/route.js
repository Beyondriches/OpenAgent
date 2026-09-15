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
    version: "0.4",
    engine: "Theo Analysis Engine",
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

    const timeframe = String(body?.timeframe || "swing")
      .trim()
      .toLowerCase();

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

    const marketUrl =
      `https://api.coingecko.com/api/v3/coins/markets` +
      `?vs_currency=usd&ids=${coinId}` +
      `&price_change_percentage=24h,7d,30d`;

    const marketResponse = await fetch(marketUrl, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!marketResponse.ok) {
      throw new Error(
        `CoinGecko market request returned ${marketResponse.status}`
      );
    }

    const marketData = await marketResponse.json();
    const coin = marketData[0];

    if (!coin) {
      throw new Error("No market data returned.");
    }

    const historyDays =
      timeframe === "day"
        ? 7
        : timeframe === "long-term"
        ? 90
        : 30;

    const historyUrl =
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart` +
      `?vs_currency=usd&days=${historyDays}`;

    const historyResponse = await fetch(historyUrl, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!historyResponse.ok) {
      throw new Error(
        `CoinGecko history request returned ${historyResponse.status}`
      );
    }

    const history = await historyResponse.json();

    const prices = Array.isArray(history?.prices)
      ? history.prices.map((item) => item[1]).filter(Number.isFinite)
      : [];

    if (prices.length < 5) {
      throw new Error("Not enough historical price data.");
    }

    const currentPrice = Number(coin.current_price);
    const high24h = Number(coin.high_24h);
    const low24h = Number(coin.low_24h);
    const change24h = Number(coin.price_change_percentage_24h || 0);

    const average = (values) =>
      values.reduce((sum, value) => sum + value, 0) / values.length;

    const recentWindow =
      timeframe === "day"
        ? Math.min(24, prices.length)
        : timeframe === "long-term"
        ? Math.min(30, prices.length)
        : Math.min(14, prices.length);

    const recentPrices = prices.slice(-recentWindow);
    const recentAverage = average(recentPrices);

    const firstHistoricalPrice = prices[0];

    const periodChange =
      firstHistoricalPrice > 0
        ? ((currentPrice - firstHistoricalPrice) /
            firstHistoricalPrice) *
          100
        : 0;

    const range24h =
      low24h > 0
        ? ((high24h - low24h) / low24h) * 100
        : 0;

    let trend = "Neutral";

    if (
      currentPrice > recentAverage &&
      periodChange > 1
    ) {
      trend = "Bullish";
    } else if (
      currentPrice < recentAverage &&
      periodChange < -1
    ) {
      trend = "Bearish";
    }

    let momentum = "Neutral";

    if (change24h >= 3) {
      momentum = "Strong positive";
    } else if (change24h >= 0.5) {
      momentum = "Positive";
    } else if (change24h <= -3) {
      momentum = "Strong negative";
    } else if (change24h <= -0.5) {
      momentum = "Negative";
    }

    let risk = "Moderate";

    if (range24h >= 8) {
      risk = "Very High";
    } else if (range24h >= 5) {
      risk = "High";
    } else if (range24h <= 2) {
      risk = "Lower";
    }

    let score = 50;

    if (trend === "Bullish") score += 20;
    if (trend === "Bearish") score -= 20;

    if (momentum === "Strong positive") score += 15;
    if (momentum === "Positive") score += 8;
    if (momentum === "Strong negative") score -= 15;
    if (momentum === "Negative") score -= 8;

    if (risk === "Very High") score -= 8;
    if (risk === "High") score -= 4;

    score = Math.max(0, Math.min(100, Math.round(score)));

    let verdict = "WAIT";

    if (score >= 70) {
      verdict = "BUY BIAS";
    } else if (score <= 30) {
      verdict = "AVOID";
    }

    const stopPercent =
      timeframe === "day"
        ? 0.025
        : timeframe === "long-term"
        ? 0.12
        : 0.06;

    const target1Percent =
      timeframe === "day"
        ? 0.04
        : timeframe === "long-term"
        ? 0.18
        : 0.10;

    const target2Percent =
      timeframe === "day"
        ? 0.07
        : timeframe === "long-term"
        ? 0.30
        : 0.18;

    const invalidation = currentPrice * (1 - stopPercent);
    const target1 = currentPrice * (1 + target1Percent);
    const target2 = currentPrice * (1 + target2Percent);

    const entryLow = Math.min(currentPrice, recentAverage);
    const entryHigh = Math.max(currentPrice, recentAverage);

    return NextResponse.json({
      ok: true,
      symbol,
      timeframe,
      live: true,
      source: "CoinGecko",

      market: {
        name: coin.name,
        priceUSD: currentPrice,
        change24h,
        volume24hUSD: coin.total_volume,
        marketCapUSD: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
        high24h,
        low24h,
      },

      analysis: {
        verdict,
        score,
        trend,
        momentum,
        risk,
        periodChange: Number(periodChange.toFixed(2)),
        range24h: Number(range24h.toFixed(2)),
        recentAverage: Number(recentAverage.toFixed(2)),

        entryZone: {
          low: Number(entryLow.toFixed(2)),
          high: Number(entryHigh.toFixed(2)),
        },

        invalidation: Number(invalidation.toFixed(2)),

        targets: [
          Number(target1.toFixed(2)),
          Number(target2.toFixed(2)),
        ],
      },

      summary:
        `${symbol} ${timeframe} analysis: ${verdict}. ` +
        `Trend is ${trend.toLowerCase()}, momentum is ` +
        `${momentum.toLowerCase()}, with ${risk.toLowerCase()} risk.`,

      framework: [
        `Theo score: ${score}/100.`,
        `Trend: ${trend}.`,
        `Momentum: ${momentum}.`,
        `Risk level: ${risk}.`,
        "Treat the entry zone as context, not a guaranteed entry.",
        "Invalidation and targets are mechanical risk references, not predictions.",
        "Keep long-term core capital separate from speculative trading capital.",
        "Avoid FOMO entries after sharp price moves.",
      ],
    });
  } catch (error) {
    console.error("Theo analysis error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to complete live market analysis.",
      },
      { status: 500 }
    );
  }
}