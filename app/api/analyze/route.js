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

function calculateRSI(prices, period = 14) {
  if (prices.length < 2) return 50;

  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const recent = changes.slice(-Math.min(period, changes.length));

  const gains = recent.map((change) => (change > 0 ? change : 0));
  const losses = recent.map((change) => (change < 0 ? Math.abs(change) : 0));

  const avgGain = average(gains);
  const avgLoss = average(losses);

  if (avgLoss === 0) return avgGain > 0 ? 100 : 50;

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function standardDeviation(values) {
  if (!values.length) return 0;

  const mean = average(values);
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
    values.length;

  return Math.sqrt(variance);
}

function calculateVolatility(prices, period = 14) {
  if (prices.length < 2) return 0;

  const returns = [];

  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  const recent = returns.slice(-Math.min(period, returns.length));
  return standardDeviation(recent) * 100;
}

function percentChange(current, previous) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round(value, decimals = 2) {
  return Number(Number(value).toFixed(decimals));
}

function getSignal(score) {
  if (score >= 80) return "STRONG BUY";
  if (score >= 65) return "BUY";
  if (score >= 45) return "WAIT";
  if (score >= 30) return "SELL";
  return "STRONG SELL";
}

function getConfidence(score) {
  const distanceFromNeutral = Math.abs(score - 50);

  if (distanceFromNeutral >= 30) return "High";
  if (distanceFromNeutral >= 15) return "Medium";
  return "Low";
}

function calculateRiskReward(entry, invalidation, target) {
  const risk = Math.abs(entry - invalidation);
  const reward = Math.abs(target - entry);

  if (!risk) return 0;

  return reward / risk;
}

function calculateEntryProgress(price, low, high) {
  if (high <= low) return 100;

  if (price < low) {
    const distance = low - price;
    const width = high - low;
    return clamp(100 - (distance / width) * 100, 0, 100);
  }

  if (price > high) {
    const distance = price - high;
    const width = high - low;
    return clamp(100 - (distance / width) * 100, 0, 100);
  }

  return 100;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "1.0",
    engine: "Theo Decision Engine",
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
    const config = MODES[timeframe];

    if (!coinId) {
      return NextResponse.json(
        {
          ok: false,
          error: `Unsupported asset symbol: ${symbol}`,
        },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        {
          ok: false,
          error: `Unsupported analysis mode: ${timeframe}`,
        },
        { status: 400 }
      );
    }

    const marketUrl =
      "https://api.coingecko.com/api/v3/coins/markets" +
      `?vs_currency=usd&ids=${coinId}` +
      "&price_change_percentage=24h,7d,30d";

    const historyUrl =
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart` +
      `?vs_currency=usd&days=${config.days}&interval=daily`;

    const [marketResponse, historyResponse] = await Promise.all([
      fetch(marketUrl, {
        headers: { accept: "application/json" },
        cache: "no-store",
      }),
      fetch(historyUrl, {
        headers: { accept: "application/json" },
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

    const historicalPrices = Array.isArray(historyData?.prices)
      ? historyData.prices
          .map((item) => Number(item?.[1]))
          .filter((value) => Number.isFinite(value))
      : [];

    if (historicalPrices.length < 2) {
      throw new Error("Insufficient historical price data.");
    }

    const currentPrice = Number(coin.current_price);

    const fastSMA = sma(historicalPrices, config.fastPeriod);
    const slowSMA = sma(historicalPrices, config.slowPeriod);
    const rsi = calculateRSI(historicalPrices, config.rsiPeriod);
    const volatility = calculateVolatility(historicalPrices, 14);

    const recentWindow = historicalPrices.slice(-Math.min(14, historicalPrices.length));
    const recentHigh = Math.max(...recentWindow);
    const recentLow = Math.min(...recentWindow);

    const sevenDaysAgo =
      historicalPrices[Math.max(0, historicalPrices.length - 8)];

    const thirtyDaysAgo =
      historicalPrices[Math.max(0, historicalPrices.length - 31)];

    const change7d = percentChange(currentPrice, sevenDaysAgo);
    const change30d = percentChange(currentPrice, thirtyDaysAgo);

    let score = 50;

    // Trend component
    if (currentPrice > fastSMA) score += 7;
    else score -= 7;

    if (fastSMA > slowSMA) score += 10;
    else score -= 10;

    // Momentum component
    if (rsi >= 55 && rsi <= 70) score += 8;
    else if (rsi > 70) score -= 5;
    else if (rsi < 30) score += 5;
    else if (rsi < 45) score -= 6;

    // Medium-term confirmation
    if (change7d > 2) score += 5;
    else if (change7d < -2) score -= 5;

    if (change30d > 5) score += 5;
    else if (change30d < -5) score -= 5;

    // Volatility penalty
    if (volatility > 6) score -= 8;
    else if (volatility > 4) score -= 4;
    else if (volatility < 2.5) score += 3;

    score = Math.round(clamp(score, 0, 100));

    const trend =
      currentPrice > fastSMA && fastSMA > slowSMA
        ? "Bullish"
        : currentPrice < fastSMA && fastSMA < slowSMA
        ? "Bearish"
        : "Neutral";

    const momentum =
      rsi >= 60
        ? "Positive"
        : rsi <= 40
        ? "Negative"
        : "Neutral";

    const risk =
      volatility >= 6
        ? "High"
        : volatility >= 3
        ? "Medium"
        : "Low";

    const signal = getSignal(score);
    const confidence = getConfidence(score);

    let entryLow = currentPrice * (1 - config.entryPct);
    let entryHigh = currentPrice * (1 + config.entryPct);

    if (trend === "Bullish") {
      entryLow = Math.min(entryLow, fastSMA);
      entryHigh = Math.max(currentPrice, fastSMA);
    }

    if (trend === "Bearish") {
      entryLow = Math.min(currentPrice, fastSMA);
      entryHigh = Math.max(entryHigh, fastSMA);
    }

    const invalidation =
      entryLow * (1 - config.invalidationPct);

    const target1 =
      currentPrice * (1 + config.target1Pct);

    const target2 =
      currentPrice * (1 + config.target2Pct);

    const entryMidpoint = (entryLow + entryHigh) / 2;

    const rr1 = calculateRiskReward(
      entryMidpoint,
      invalidation,
      target1
    );

    const rr2 = calculateRiskReward(
      entryMidpoint,
      invalidation,
      target2
    );

    const entryProgress = calculateEntryProgress(
      currentPrice,
      entryLow,
      entryHigh
    );

    let decisionReason = "";

    if (signal === "STRONG BUY") {
      decisionReason =
        "Multiple trend and momentum conditions are aligned strongly to the upside.";
    } else if (signal === "BUY") {
      decisionReason =
        "Bullish conditions outweigh bearish conditions, but risk controls remain important.";
    } else if (signal === "WAIT") {
      decisionReason =
        "The indicators are mixed or insufficiently aligned for a high-conviction entry.";
    } else if (signal === "SELL") {
      decisionReason =
        "Bearish conditions currently outweigh bullish conditions.";
    } else {
      decisionReason =
        "Multiple indicators are aligned negatively and downside conditions dominate.";
    }

    return NextResponse.json({
      ok: true,
      symbol,
      timeframe,
      live: true,
      source: "CoinGecko",

      market: {
        name: coin.name,
        priceUSD: round(currentPrice),
        change24h: round(
          coin.price_change_percentage_24h ?? 0
        ),
        volume24hUSD: coin.total_volume,
        marketCapUSD: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
      },

      analysis: {
        verdict: signal,
        score,
        confidence,
        reason: decisionReason,
        trend,
        momentum,
        risk,

        entryProgress: round(entryProgress, 0),

        entryZone: {
          low: round(entryLow),
          high: round(entryHigh),
        },

        invalidation: round(invalidation),

        targets: [
          round(target1),
          round(target2),
        ],

        riskReward: {
          target1: round(rr1),
          target2: round(rr2),
        },
      },

      technicals: {
        rsi: round(rsi, 1),
        fastSMA: round(fastSMA),
        slowSMA: round(slowSMA),
        volatility14d: round(volatility),
        recentHigh: round(recentHigh),
        recentLow: round(recentLow),
        change7d: round(change7d),
        change30d: round(change30d),
      },

      summary:
        `${symbol} ${timeframe} analysis: ${signal}. ` +
        `Theo score ${score}/100 with ${confidence.toLowerCase()} confidence. ` +
        `${decisionReason}`,

      framework: [
        `Signal confidence: ${confidence}.`,
        `Risk/reward to Target 1: ${round(rr1)}:1.`,
        `Risk/reward to Target 2: ${round(rr2)}:1.`,
        `Entry-zone proximity: ${round(entryProgress, 0)}%.`,
        `Trend: ${trend}.`,
        `Momentum: ${momentum}.`,
        `RSI: ${round(rsi, 1)}.`,
        "Treat the entry zone as context, not a guaranteed entry.",
        "Invalidation defines where the trade thesis should be reconsidered.",
        "Keep long-term core capital separate from speculative trading capital.",
        "Avoid FOMO entries after sharp price moves.",
      ],
    });
  } catch (error) {
    console.error("Theo v1.0 analysis error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to complete Theo Decision Engine analysis.",
      },
      { status: 500 }
    );
  }
}