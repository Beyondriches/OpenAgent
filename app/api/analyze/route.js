import { NextResponse } from "next/server";

const COINS = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  DOT: "polkadot",
  LTC: "litecoin",
};

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return null;

  const slice = prices.slice(-(period + 1));

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < slice.length; i++) {
    const change = slice[i] - slice[i - 1];

    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;

  return 100 - 100 / (1 + rs);
}

function calculateVolatility(prices) {
  if (!prices || prices.length < 2) return 0;

  const returns = [];

  for (let i = 1; i < prices.length; i++) {
    returns.push(
      ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100
    );
  }

  const mean = average(returns);

  const variance =
    returns.reduce(
      (sum, value) => sum + Math.pow(value - mean, 2),
      0
    ) / returns.length;

  return Math.sqrt(variance);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "0.6",
    engine: "Theo Technical Analysis Engine",
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
          error:
            "Unsupported asset. Try BTC, ETH, SOL, XRP, ADA, DOGE, AVAX, LINK, DOT or LTC.",
        },
        { status: 400 }
      );
    }

    /*
      Current market information
    */

    const marketUrl =
      "https://api.coingecko.com/api/v3/coins/markets" +
      `?vs_currency=usd&ids=${coinId}` +
      "&price_change_percentage=24h,7d,30d";

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

    /*
      Historical prices for technical indicators
    */

    const chartUrl =
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart` +
      "?vs_currency=usd&days=30&interval=daily";

    const chartResponse = await fetch(chartUrl, {
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!chartResponse.ok) {
      throw new Error(
        `CoinGecko chart request returned ${chartResponse.status}`
      );
    }

    const chartData = await chartResponse.json();

    const prices = (chartData.prices || []).map(
      (item) => Number(item[1])
    );

    if (prices.length < 15) {
      throw new Error("Not enough historical price data.");
    }

    /*
      Technical indicators
    */

    const currentPrice = Number(coin.current_price);

    const sma7 = average(prices.slice(-7));
    const sma14 = average(prices.slice(-14));
    const sma30 = average(prices.slice(-30));

    const rsi = calculateRSI(prices, 14);

    const volatility = calculateVolatility(
      prices.slice(-14)
    );

    const change24 =
      Number(coin.price_change_percentage_24h) || 0;

    const change7 =
      Number(
        coin.price_change_percentage_7d_in_currency
      ) || 0;

    const change30 =
      Number(
        coin.price_change_percentage_30d_in_currency
      ) || 0;

    /*
      Trend analysis
    */

    let trend = "Neutral";

    if (
      currentPrice > sma7 &&
      sma7 > sma14 &&
      sma14 > sma30
    ) {
      trend = "Bullish";
    }

    if (
      currentPrice < sma7 &&
      sma7 < sma14 &&
      sma14 < sma30
    ) {
      trend = "Bearish";
    }

    /*
      Momentum analysis
    */

    let momentum = "Neutral";

    if (rsi !== null) {
      if (rsi >= 55 && change7 > 0) {
        momentum = "Positive";
      }

      if (rsi <= 45 && change7 < 0) {
        momentum = "Negative";
      }

      if (rsi >= 70) {
        momentum = "Overbought";
      }

      if (rsi <= 30) {
        momentum = "Oversold";
      }
    }

    /*
      Risk model
    */

    let risk = "Medium";

    if (volatility >= 5) {
      risk = "High";
    }

    if (volatility < 2.5) {
      risk = "Low";
    }

    /*
      Theo Score
    */

    let score = 50;

    if (trend === "Bullish") score += 20;
    if (trend === "Bearish") score -= 20;

    if (momentum === "Positive") score += 15;
    if (momentum === "Negative") score -= 15;

    if (momentum === "Oversold") score += 8;
    if (momentum === "Overbought") score -= 8;

    if (change24 > 0) score += 4;
    if (change24 < 0) score -= 4;

    if (change7 > 5) score += 6;
    if (change7 < -5) score -= 6;

    if (currentPrice > sma30) score += 5;
    if (currentPrice < sma30) score -= 5;

    if (risk === "High") score -= 5;

    score = Math.max(0, Math.min(100, score));

    /*
      Signal
    */

    let verdict = "WAIT";

    if (
      score >= 70 &&
      trend === "Bullish" &&
      momentum !== "Overbought"
    ) {
      verdict = "BUY";
    }

    if (
      score <= 30 ||
      (
        trend === "Bearish" &&
        momentum === "Negative"
      )
    ) {
      verdict = "AVOID";
    }

    /*
      Mechanical risk references
    */

    const recentPrices = prices.slice(-7);

    const recentAverage = average(recentPrices);

    const recentHigh = Math.max(...recentPrices);
    const recentLow = Math.min(...recentPrices);

    const range24 =
      coin.high_24h && coin.low_24h
        ? ((coin.high_24h - coin.low_24h) /
            coin.low_24h) *
          100
        : 0;

    let entryLow;
    let entryHigh;
    let invalidation;
    let target1;
    let target2;

    if (timeframe === "day") {
      entryLow = currentPrice * 0.995;
      entryHigh = currentPrice * 1.005;
      invalidation = currentPrice * 0.975;
      target1 = currentPrice * 1.025;
      target2 = currentPrice * 1.05;
    } else if (timeframe === "long-term") {
      entryLow = Math.min(
        currentPrice,
        recentAverage * 0.95
      );

      entryHigh = recentAverage;

      invalidation = recentLow * 0.85;

      target1 = currentPrice * 1.2;
      target2 = currentPrice * 1.4;
    } else {
      entryLow = Math.min(currentPrice, recentAverage);

      entryHigh = Math.max(
        currentPrice,
        recentAverage
      );

      invalidation = recentLow * 0.94;

      target1 = currentPrice * 1.1;
      target2 = currentPrice * 1.18;
    }

    /*
      API response
    */

    return NextResponse.json({
      ok: true,

      symbol,
      timeframe,

      live: true,

      source: "CoinGecko",

      market: {
        name: coin.name,
        priceUSD: currentPrice,
        change24h: change24,
        change7d: change7,
        change30d: change30,
        volume24hUSD: coin.total_volume,
        marketCapUSD: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
      },

      technicals: {
        rsi14:
          rsi === null
            ? null
            : Number(rsi.toFixed(1)),

        sma7: Number(sma7.toFixed(2)),
        sma14: Number(sma14.toFixed(2)),
        sma30: Number(sma30.toFixed(2)),

        volatility14d: Number(
          volatility.toFixed(2)
        ),

        recentHigh: Number(
          recentHigh.toFixed(2)
        ),

        recentLow: Number(
          recentLow.toFixed(2)
        ),
      },

      analysis: {
        verdict,
        score: Math.round(score),
        trend,
        momentum,
        risk,

        periodChange: Number(
          change7.toFixed(2)
        ),

        range24h: Number(
          range24.toFixed(2)
        ),

        recentAverage: Number(
          recentAverage.toFixed(2)
        ),

        entryZone: {
          low: Number(entryLow.toFixed(2)),
          high: Number(entryHigh.toFixed(2)),
        },

        invalidation: Number(
          invalidation.toFixed(2)
        ),

        targets: [
          Number(target1.toFixed(2)),
          Number(target2.toFixed(2)),
        ],
      },

      summary:
        `${symbol} ${timeframe} analysis: ${verdict}. ` +
        `Trend is ${trend.toLowerCase()}, ` +
        `momentum is ${momentum.toLowerCase()}, ` +
        `RSI is ${
          rsi === null ? "unavailable" : rsi.toFixed(1)
        }, with ${risk.toLowerCase()} volatility risk.`,

      framework: [
        `Theo score: ${Math.round(score)}/100.`,
        `RSI (14): ${
          rsi === null ? "N/A" : rsi.toFixed(1)
        }.`,
        `7-day SMA: $${sma7.toFixed(2)}.`,
        `14-day SMA: $${sma14.toFixed(2)}.`,
        `30-day SMA: $${sma30.toFixed(2)}.`,
        `14-day volatility: ${volatility.toFixed(2)}%.`,
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
    console.error("Theo technical analysis error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to complete live technical analysis.",
      },
      { status: 500 }
    );
  }
}