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
};

const MODES = {
  day: {
    days: 30,
    fastPeriod: 3,
    slowPeriod: 7,
    rsiPeriod: 7,
    entryPct: 0.008,
    invalidationPct: 0.025,
    target1Pct: 0.025,
    target2Pct: 0.05,
  },
  swing: {
    days: 90,
    fastPeriod: 7,
    slowPeriod: 30,
    rsiPeriod: 14,
    entryPct: 0.015,
    invalidationPct: 0.07,
    target1Pct: 0.1,
    target2Pct: 0.18,
  },
  "long-term": {
    days: 365,
    fastPeriod: 50,
    slowPeriod: 200,
    rsiPeriod: 14,
    entryPct: 0.04,
    invalidationPct: 0.15,
    target1Pct: 0.25,
    target2Pct: 0.5,
  },
};

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sma(values, period) {
  if (!values.length) return 0;
  const slice = values.slice(-Math.min(period, values.length));
  return average(slice);
}

function calculateRSI(values, period = 14) {
  if (values.length < 2) return 50;

  const usablePeriod = Math.min(period, values.length - 1);
  const slice = values.slice(-(usablePeriod + 1));

  let gains = 0;
  let losses = 0;

  for (let i = 1; i < slice.length; i++) {
    const change = slice[i] - slice[i - 1];

    if (change > 0) gains += change;
    if (change < 0) losses += Math.abs(change);
  }

  const avgGain = gains / usablePeriod;
  const avgLoss = losses / usablePeriod;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function volatility(values, period = 14) {
  if (values.length < 2) return 0;

  const slice = values.slice(-(period + 1));
  const returns = [];

  for (let i = 1; i < slice.length; i++) {
    returns.push(
      ((slice[i] - slice[i - 1]) / slice[i - 1]) * 100
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

function percentageChange(current, previous) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "0.9",
    engine: "Multi-Timeframe Intelligence",
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

    const requestedMode = String(body?.timeframe || "swing")
      .trim()
      .toLowerCase();

    const timeframe = MODES[requestedMode]
      ? requestedMode
      : "swing";

    const config = MODES[timeframe];
    const coinId = COINS[symbol];

    if (!coinId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Unsupported symbol. Try BTC, ETH, SOL, XRP, ADA, DOGE, AVAX or LINK.",
        },
        { status: 400 }
      );
    }

    const marketUrl =
      `https://api.coingecko.com/api/v3/coins/markets` +
      `?vs_currency=usd&ids=${coinId}` +
      `&price_change_percentage=24h,7d,30d`;

    const historyUrl =
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart` +
      `?vs_currency=usd&days=${config.days}&interval=daily`;

    const [marketResponse, historyResponse] = await Promise.all([
      fetch(marketUrl, {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }),
      fetch(historyUrl, {
        headers: {
          accept: "application/json",
        },
        cache: "no-store",
      }),
    ]);

    if (!marketResponse.ok) {
      throw new Error(
        `CoinGecko market request returned ${marketResponse.status}`
      );
    }

    if (!historyResponse.ok) {
      throw new Error(
        `CoinGecko history request returned ${historyResponse.status}`
      );
    }

    const marketData = await marketResponse.json();
    const historyData = await historyResponse.json();

    const coin = marketData?.[0];

    if (!coin) {
      throw new Error("No market data returned.");
    }

    const prices = Array.isArray(historyData?.prices)
      ? historyData.prices
          .map((item) => Number(item?.[1]))
          .filter(Number.isFinite)
      : [];

    if (prices.length < 5) {
      throw new Error("Not enough historical price data.");
    }

    const price = Number(coin.current_price);
    const fastSMA = sma(prices, config.fastPeriod);
    const slowSMA = sma(prices, config.slowPeriod);
    const rsi = calculateRSI(prices, config.rsiPeriod);
    const vol = volatility(prices, 14);

    const recentWindow = prices.slice(-Math.min(30, prices.length));
    const recentHigh = Math.max(...recentWindow);
    const recentLow = Math.min(...recentWindow);

    const periodStart = prices[0];
    const periodChange = percentageChange(price, periodStart);

    let trend = "Neutral";

    if (price > fastSMA && fastSMA > slowSMA) {
      trend = "Bullish";
    } else if (price < fastSMA && fastSMA < slowSMA) {
      trend = "Bearish";
    }

    let momentum = "Neutral";

    if (rsi >= 60) momentum = "Positive";
    if (rsi <= 40) momentum = "Negative";

    let risk = "Low";

    if (vol >= 5) {
      risk = "High";
    } else if (vol >= 3) {
      risk = "Medium";
    }

    let score = 50;

    if (trend === "Bullish") score += 18;
    if (trend === "Bearish") score -= 18;

    if (momentum === "Positive") score += 12;
    if (momentum === "Negative") score -= 12;

    if (rsi > 70) score -= 8;
    if (rsi < 30) score += 5;

    if (periodChange > 10) score += 5;
    if (periodChange < -10) score -= 5;

    if (risk === "High") score -= 8;
    if (risk === "Medium") score -= 3;

    score = Math.round(clamp(score, 0, 100));

    let verdict = "WAIT";

    if (score >= 70) {
      verdict = "BUY BIAS";
    } else if (score <= 30) {
      verdict = "DEFENSIVE";
    }

    const entryLow = price * (1 - config.entryPct);
    const entryHigh = price * (1 + config.entryPct * 0.35);

    const invalidation =
      entryLow * (1 - config.invalidationPct);

    const target1 =
      price * (1 + config.target1Pct);

    const target2 =
      price * (1 + config.target2Pct);

    const range24h =
      coin.high_24h && coin.low_24h
        ? percentageChange(coin.high_24h, coin.low_24h)
        : 0;

    return NextResponse.json({
      ok: true,
      version: "0.9",
      engine: "Multi-Timeframe Intelligence",
      symbol,
      timeframe,
      live: true,
      source: "CoinGecko",

      timeframeProfile: {
        historicalDays: config.days,
        fastSMA: config.fastPeriod,
        slowSMA: config.slowPeriod,
        rsiPeriod: config.rsiPeriod,
      },

      market: {
        name: coin.name,
        priceUSD: price,
        change24h: coin.price_change_percentage_24h,
        volume24hUSD: coin.total_volume,
        marketCapUSD: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
      },

      analysis: {
        verdict,
        score,
        trend,
        momentum,
        risk,

        rsi: Number(rsi.toFixed(1)),
        fastSMA: Number(fastSMA.toFixed(2)),
        slowSMA: Number(slowSMA.toFixed(2)),
        volatility14d: Number(vol.toFixed(2)),

        recentHigh: Number(recentHigh.toFixed(2)),
        recentLow: Number(recentLow.toFixed(2)),
        periodChange: Number(periodChange.toFixed(2)),
        range24h: Number(range24h.toFixed(2)),

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
        `Theo score ${score}/100. ` +
        `Trend is ${trend.toLowerCase()}, ` +
        `momentum is ${momentum.toLowerCase()}, ` +
        `RSI ${rsi.toFixed(1)}, with ${risk.toLowerCase()} volatility risk.`,

      framework: [
        `Timeframe engine: ${config.days}-day historical window.`,
        `Fast/slow averages: SMA ${config.fastPeriod} / SMA ${config.slowPeriod}.`,
        `RSI period: ${config.rsiPeriod}.`,
        "Treat the entry zone as context, not a guaranteed entry.",
        "Invalidation and targets are mechanical risk references, not predictions.",
        "Keep long-term core capital separate from speculative trading capital.",
        "Avoid FOMO entries after sharp price moves.",
      ],
    });
  } catch (error) {
    console.error("Theo v0.9 analysis error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to complete multi-timeframe market analysis.",
      },
      { status: 500 }
    );
  }
}