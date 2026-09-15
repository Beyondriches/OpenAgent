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
    minRR: 1.5,
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
    minRR: 1.5,
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
    minRR: 1.75,
  },
};

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sma(values, period) {
  if (!values.length) return 0;

  const slice = values.slice(
    -Math.min(period, values.length)
  );

  return average(slice);
}

function calculateRSI(prices, period = 14) {
  if (prices.length < 2) return 50;

  const changes = [];

  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const recent = changes.slice(
    -Math.min(period, changes.length)
  );

  const gains = recent.map((change) =>
    change > 0 ? change : 0
  );

  const losses = recent.map((change) =>
    change < 0 ? Math.abs(change) : 0
  );

  const avgGain = average(gains);
  const avgLoss = average(losses);

  if (avgLoss === 0) {
    return avgGain > 0 ? 100 : 50;
  }

  const rs = avgGain / avgLoss;

  return 100 - 100 / (1 + rs);
}

function standardDeviation(values) {
  if (!values.length) return 0;

  const mean = average(values);

  const variance =
    values.reduce(
      (sum, value) =>
        sum + Math.pow(value - mean, 2),
      0
    ) / values.length;

  return Math.sqrt(variance);
}

function calculateVolatility(prices, period = 14) {
  if (prices.length < 2) return 0;

  const returns = [];

  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push(
        (prices[i] - prices[i - 1]) /
          prices[i - 1]
      );
    }
  }

  const recent = returns.slice(
    -Math.min(period, returns.length)
  );

  return standardDeviation(recent) * 100;
}

function percentChange(current, previous) {
  if (!previous) return 0;

  return (
    ((current - previous) / previous) *
    100
  );
}

function clamp(value, min, max) {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function round(value, decimals = 2) {
  return Number(
    Number(value).toFixed(decimals)
  );
}

function getSignal(score) {
  if (score >= 80) return "STRONG BUY";
  if (score >= 65) return "BUY";
  if (score >= 45) return "WAIT";
  if (score >= 30) return "SELL";

  return "STRONG SELL";
}

function getConfidence(score) {
  const distance =
    Math.abs(score - 50);

  if (distance >= 30) return "High";
  if (distance >= 15) return "Medium";

  return "Low";
}

function calculateRiskReward(
  entry,
  invalidation,
  target
) {
  const risk =
    Math.abs(entry - invalidation);

  const reward =
    Math.abs(target - entry);

  if (!risk) return 0;

  return reward / risk;
}

function calculateEntryProgress(
  price,
  low,
  high
) {
  if (high <= low) return 100;

  if (price >= low && price <= high) {
    return 100;
  }

  const width = high - low;

  if (price < low) {
    const distance = low - price;

    return clamp(
      100 - (distance / width) * 100,
      0,
      100
    );
  }

  const distance = price - high;

  return clamp(
    100 - (distance / width) * 100,
    0,
    100
  );
}

function evaluateRiskReward(
  rr1,
  rr2,
  minimumRR
) {
  let adjustment = 0;
  let quality = "Acceptable";
  let explanation =
    "Risk/reward is adequate for the selected timeframe.";

  if (rr2 < 1) {
    adjustment = -20;
    quality = "Poor";
    explanation =
      "Potential reward does not justify the downside risk.";
  } else if (rr2 < minimumRR) {
    adjustment = -12;
    quality = "Weak";
    explanation =
      "Risk/reward is below Theo's minimum requirement for this timeframe.";
  } else if (rr1 < 1 && rr2 >= minimumRR) {
    adjustment = -5;
    quality = "Mixed";
    explanation =
      "The first target has weak risk/reward, although the second target is acceptable.";
  } else if (
    rr1 >= 1 &&
    rr2 >= minimumRR
  ) {
    adjustment = 4;
    quality = "Good";
    explanation =
      "Both the initial target and extended target offer reasonable trade economics.";
  }

  if (rr1 >= 1.5 && rr2 >= 2) {
    adjustment = 8;
    quality = "Strong";
    explanation =
      "The setup offers strong reward relative to the defined downside risk.";
  }

  return {
    adjustment,
    quality,
    explanation,
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "1.1",
    engine: "Theo Risk-Aware Decision Engine",
    endpoint: "/api/analyze",
    marketData: "CoinGecko",
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const symbol = String(
      body?.symbol || "ETH"
    )
      .trim()
      .toUpperCase();

    const timeframe = String(
      body?.timeframe || "swing"
    )
      .trim()
      .toLowerCase();

    const coinId = COINS[symbol];
    const config = MODES[timeframe];

    if (!coinId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Unsupported asset symbol: ${symbol}`,
        },
        { status: 400 }
      );
    }

    if (!config) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Unsupported analysis mode: ${timeframe}`,
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

    const [
      marketResponse,
      historyResponse,
    ] = await Promise.all([
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

    const marketData =
      await marketResponse.json();

    const historyData =
      await historyResponse.json();

    const coin = marketData?.[0];

    if (!coin) {
      throw new Error(
        "No market data returned."
      );
    }

    const historicalPrices =
      Array.isArray(historyData?.prices)
        ? historyData.prices
            .map((item) =>
              Number(item?.[1])
            )
            .filter((value) =>
              Number.isFinite(value)
            )
        : [];

    if (historicalPrices.length < 2) {
      throw new Error(
        "Insufficient historical price data."
      );
    }

    const currentPrice =
      Number(coin.current_price);

    const fastSMA = sma(
      historicalPrices,
      config.fastPeriod
    );

    const slowSMA = sma(
      historicalPrices,
      config.slowPeriod
    );

    const rsi = calculateRSI(
      historicalPrices,
      config.rsiPeriod
    );

    const volatility =
      calculateVolatility(
        historicalPrices,
        14
      );

    const recentWindow =
      historicalPrices.slice(
        -Math.min(
          14,
          historicalPrices.length
        )
      );

    const recentHigh =
      Math.max(...recentWindow);

    const recentLow =
      Math.min(...recentWindow);

    const sevenDaysAgo =
      historicalPrices[
        Math.max(
          0,
          historicalPrices.length - 8
        )
      ];

    const thirtyDaysAgo =
      historicalPrices[
        Math.max(
          0,
          historicalPrices.length - 31
        )
      ];

    const change7d =
      percentChange(
        currentPrice,
        sevenDaysAgo
      );

    const change30d =
      percentChange(
        currentPrice,
        thirtyDaysAgo
      );

    /*
      PHASE 1
      Technical score before trade economics.
    */

    let technicalScore = 50;

    if (currentPrice > fastSMA) {
      technicalScore += 7;
    } else {
      technicalScore -= 7;
    }

    if (fastSMA > slowSMA) {
      technicalScore += 10;
    } else {
      technicalScore -= 10;
    }

    if (rsi >= 55 && rsi <= 70) {
      technicalScore += 8;
    } else if (rsi > 70) {
      technicalScore -= 5;
    } else if (rsi < 30) {
      technicalScore += 5;
    } else if (rsi < 45) {
      technicalScore -= 6;
    }

    if (change7d > 2) {
      technicalScore += 5;
    } else if (change7d < -2) {
      technicalScore -= 5;
    }

    if (change30d > 5) {
      technicalScore += 5;
    } else if (change30d < -5) {
      technicalScore -= 5;
    }

    if (volatility > 6) {
      technicalScore -= 8;
    } else if (volatility > 4) {
      technicalScore -= 4;
    } else if (volatility < 2.5) {
      technicalScore += 3;
    }

    technicalScore =
      Math.round(
        clamp(
          technicalScore,
          0,
          100
        )
      );

    const trend =
      currentPrice > fastSMA &&
      fastSMA > slowSMA
        ? "Bullish"
        : currentPrice < fastSMA &&
          fastSMA < slowSMA
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

    /*
      PHASE 2
      Construct the potential trade.
    */

    let entryLow =
      currentPrice *
      (1 - config.entryPct);

    let entryHigh =
      currentPrice *
      (1 + config.entryPct);

    if (trend === "Bullish") {
      entryLow = Math.min(
        entryLow,
        fastSMA
      );

      entryHigh = Math.max(
        currentPrice,
        fastSMA
      );
    }

    if (trend === "Bearish") {
      entryLow = Math.min(
        currentPrice,
        fastSMA
      );

      entryHigh = Math.max(
        entryHigh,
        fastSMA
      );
    }

    const invalidation =
      entryLow *
      (1 - config.invalidationPct);

    const target1 =
      currentPrice *
      (1 + config.target1Pct);

    const target2 =
      currentPrice *
      (1 + config.target2Pct);

    const entryMidpoint =
      (entryLow + entryHigh) / 2;

    const rr1 =
      calculateRiskReward(
        entryMidpoint,
        invalidation,
        target1
      );

    const rr2 =
      calculateRiskReward(
        entryMidpoint,
        invalidation,
        target2
      );

    /*
      PHASE 3
      Let trade economics influence Theo.
    */

    const rrEvaluation =
      evaluateRiskReward(
        rr1,
        rr2,
        config.minRR
      );

    let score =
      technicalScore +
      rrEvaluation.adjustment;

    score =
      Math.round(
        clamp(score, 0, 100)
      );

    let signal = getSignal(score);

    /*
      Hard risk/reward guardrail:
      Theo cannot issue BUY if even Target 2
      fails the timeframe's minimum R:R.
    */

    if (
      (signal === "BUY" ||
        signal === "STRONG BUY") &&
      rr2 < config.minRR
    ) {
      signal = "WAIT";
    }

    /*
      STRONG BUY requires better economics
      than an ordinary BUY.
    */

    if (
      signal === "STRONG BUY" &&
      (rr1 < 1.25 || rr2 < 2)
    ) {
      signal = "BUY";
    }

    const confidence =
      getConfidence(score);

    const entryProgress =
      calculateEntryProgress(
        currentPrice,
        entryLow,
        entryHigh
      );

    let decisionReason = "";

    if (signal === "STRONG BUY") {
      decisionReason =
        "Technical conditions and trade economics are strongly aligned, with attractive reward relative to defined risk.";
    } else if (signal === "BUY") {
      decisionReason =
        "Bullish evidence is strong enough for a positive setup and the risk/reward profile meets Theo's requirements.";
    } else if (
      signal === "WAIT" &&
      rr2 < config.minRR
    ) {
      decisionReason =
        `Technical conditions may be constructive, but the current risk/reward is not attractive enough. Target 2 offers ${round(
          rr2
        )}:1 versus Theo's ${config.minRR}:1 minimum for ${timeframe} setups.`;
    } else if (signal === "WAIT") {
      decisionReason =
        "The indicators remain mixed or insufficiently aligned for a high-conviction entry.";
    } else if (signal === "SELL") {
      decisionReason =
        "Bearish conditions currently outweigh bullish conditions and the setup does not justify new long exposure.";
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
      version: "1.1",

      market: {
        name: coin.name,
        priceUSD:
          round(currentPrice),

        change24h:
          round(
            coin.price_change_percentage_24h ??
              0
          ),

        volume24hUSD:
          coin.total_volume,

        marketCapUSD:
          coin.market_cap,

        marketCapRank:
          coin.market_cap_rank,
      },

      analysis: {
        verdict: signal,

        score,

        technicalScore,

        confidence,

        reason:
          decisionReason,

        trend,

        momentum,

        risk,

        entryProgress:
          round(entryProgress, 0),

        entryZone: {
          low: round(entryLow),
          high: round(entryHigh),
        },

        invalidation:
          round(invalidation),

        targets: [
          round(target1),
          round(target2),
        ],

        riskReward: {
          target1: round(rr1),
          target2: round(rr2),

          minimum:
            config.minRR,

          quality:
            rrEvaluation.quality,

          scoreAdjustment:
            rrEvaluation.adjustment,

          explanation:
            rrEvaluation.explanation,
        },
      },

      technicals: {
        rsi:
          round(rsi, 1),

        fastSMA:
          round(fastSMA),

        slowSMA:
          round(slowSMA),

        volatility14d:
          round(volatility),

        recentHigh:
          round(recentHigh),

        recentLow:
          round(recentLow),

        change7d:
          round(change7d),

        change30d:
          round(change30d),
      },

      summary:
        `${symbol} ${timeframe} analysis: ${signal}. ` +
        `Technical score ${technicalScore}/100. ` +
        `Risk-adjusted Theo score ${score}/100 with ${confidence.toLowerCase()} confidence. ` +
        decisionReason,

      framework: [
        `Technical score before risk/reward: ${technicalScore}/100.`,

        `Risk/reward adjustment: ${
          rrEvaluation.adjustment >= 0
            ? "+"
            : ""
        }${rrEvaluation.adjustment} points.`,

        `Final Theo score: ${score}/100.`,

        `Risk/reward quality: ${rrEvaluation.quality}.`,

        `Risk/reward to Target 1: ${round(
          rr1
        )}:1.`,

        `Risk/reward to Target 2: ${round(
          rr2
        )}:1.`,

        `Minimum preferred R:R for this mode: ${config.minRR}:1.`,

        `Entry-zone proximity: ${round(
          entryProgress,
          0
        )}%.`,

        `Trend: ${trend}.`,

        `Momentum: ${momentum}.`,

        `RSI: ${round(rsi, 1)}.`,

        "A technically attractive market is not automatically an attractive trade.",

        "Invalidation defines where the trade thesis should be reconsidered.",

        "Keep long-term core capital separate from speculative trading capital.",

        "Avoid FOMO entries after sharp price moves.",
      ],
    });
  } catch (error) {
    console.error(
      "Theo v1.1 analysis error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to complete Theo Risk-Aware Decision Engine analysis.",
      },
      { status: 500 }
    );
  }
}