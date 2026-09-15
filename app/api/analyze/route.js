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

/*
  v1.4 RISK PROFILE

  Aggressive means Theo may accept larger predefined
  risk when setup quality supports it.

  It does NOT mean:
  - chasing poor entries
  - ignoring invalidation
  - sizing WAIT / AVOID trades
  - risking core long-term holdings on short-term trades
*/

const RISK_PROFILE = {
  name: "Aggressive Growth",

day: {
  baseRiskPct: 2.0,
  maxRiskPct: 4.0,
},

swing: {
  baseRiskPct: 2.5,
  maxRiskPct: 5.0,
},

  longTerm: {
    baseAllocationPct: 5,
    strongAllocationPct: 8,
    maxAllocationPct: 10,
  },
};

function average(values) {
  if (!values.length) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function sma(values, period) {
  if (!values.length) return 0;

  return average(
    values.slice(-Math.min(period, values.length))
  );
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

  const gains = recent.map((x) => (x > 0 ? x : 0));
  const losses = recent.map((x) =>
    x < 0 ? Math.abs(x) : 0
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

  return (
    standardDeviation(
      returns.slice(
        -Math.min(period, returns.length)
      )
    ) * 100
  );
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

function calculateRiskReward(
  entry,
  invalidation,
  target
) {
  const risk = Math.abs(entry - invalidation);
  const reward = Math.abs(target - entry);

  if (!risk) return 0;

  return reward / risk;
}

function calculateEntryProgress(price, low, high) {
  if (high <= low) return 100;

  if (price >= low && price <= high) {
    return 100;
  }

  const width = high - low;

  if (price < low) {
    return clamp(
      100 - ((low - price) / width) * 100,
      0,
      100
    );
  }

  return clamp(
    100 - ((price - high) / width) * 100,
    0,
    100
  );
}

function getConfidence(score) {
  const distance = Math.abs(score - 50);

  if (distance >= 30) return "High";
  if (distance >= 15) return "Medium";

  return "Low";
}

function getOutlook(technicalScore) {
  if (technicalScore >= 80) {
    return "STRONGLY BULLISH";
  }

  if (technicalScore >= 65) {
    return "BULLISH";
  }

  if (technicalScore >= 45) {
    return "NEUTRAL";
  }

  if (technicalScore >= 30) {
    return "BEARISH";
  }

  return "STRONGLY BEARISH";
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
      "Potential reward does not justify the defined downside risk.";
  } else if (rr2 < minimumRR) {
    adjustment = -12;
    quality = "Weak";
    explanation =
      "Risk/reward is below Theo's minimum requirement for this timeframe.";
  } else if (rr1 < 1) {
    adjustment = -5;
    quality = "Mixed";
    explanation =
      "The first target has weak risk/reward, although the second target is acceptable.";
  } else if (rr1 >= 1.5 && rr2 >= 2) {
    adjustment = 8;
    quality = "Strong";
    explanation =
      "The setup offers strong reward relative to the defined downside risk.";
  } else {
    adjustment = 4;
    quality = "Good";
    explanation =
      "Both the initial target and extended target offer reasonable trade economics.";
  }

  return {
    adjustment,
    quality,
    explanation,
  };
}

function evaluateEntryQuality({
  price,
  fastSMA,
  recentHigh,
  recentLow,
  rsi,
  timeframe,
}) {
  const distanceFromFastSMA =
    fastSMA > 0
      ? ((price - fastSMA) / fastSMA) * 100
      : 0;

  const range = recentHigh - recentLow;

  const rangePosition =
    range > 0
      ? clamp(
          ((price - recentLow) / range) * 100,
          0,
          100
        )
      : 50;

  let adjustment = 0;

  if (distanceFromFastSMA <= -3) {
    adjustment += 6;
  } else if (distanceFromFastSMA <= -1) {
    adjustment += 3;
  } else if (distanceFromFastSMA >= 6) {
    adjustment -= 10;
  } else if (distanceFromFastSMA >= 3) {
    adjustment -= 5;
  }

  if (rangePosition <= 25) {
    adjustment += 5;
  } else if (rangePosition <= 45) {
    adjustment += 2;
  } else if (rangePosition >= 90) {
    adjustment -= 8;
  } else if (rangePosition >= 75) {
    adjustment -= 4;
  }

  if (rsi >= 75) {
    adjustment -= 8;
  } else if (rsi >= 68) {
    adjustment -= 4;
  } else if (rsi <= 32) {
    adjustment += 4;
  }

  if (
    timeframe === "day" &&
    distanceFromFastSMA >= 2
  ) {
    adjustment -= 3;
  }

  if (
    timeframe === "long-term" &&
    adjustment < 0
  ) {
    adjustment = Math.ceil(adjustment * 0.7);
  }

  adjustment = clamp(adjustment, -15, 10);

  let quality = "Fair";
  let explanation =
    "The current price is reasonably positioned, but does not offer a major entry advantage.";

  if (adjustment >= 8) {
    quality = "Discounted";
    explanation =
      "Price is favorably positioned relative to its trend and recent trading range.";
  } else if (adjustment >= 3) {
    quality = "Attractive";
    explanation =
      "The current price offers a relatively favorable entry compared with recent market structure.";
  } else if (adjustment <= -10) {
    quality = "Chasing";
    explanation =
      "Price is significantly extended, making a fresh entry vulnerable to buying after the move.";
  } else if (adjustment <= -4) {
    quality = "Stretched";
    explanation =
      "Price is somewhat extended relative to recent structure, reducing entry quality.";
  }

  return {
    adjustment,
    quality,
    explanation,
    distanceFromFastSMA,
    rangePosition,
  };
}

function determineAction({
  timeframe,
  outlook,
  finalScore,
  rrEvaluation,
  entryQuality,
  rr2,
  minimumRR,
}) {
  const bullish =
    outlook === "BULLISH" ||
    outlook === "STRONGLY BULLISH";

  const bearish =
    outlook === "BEARISH" ||
    outlook === "STRONGLY BEARISH";

  if (rr2 < minimumRR) {
    return {
      action: bullish ? "WAIT" : "AVOID",
      reason:
        `Risk/reward does not meet Theo's ${minimumRR}:1 minimum requirement for this timeframe.`,
    };
  }

  if (entryQuality.quality === "Chasing") {
    return {
      action: bullish
        ? "WAIT FOR PULLBACK"
        : "AVOID",
      reason:
        "The current price is excessively extended relative to recent structure.",
    };
  }

  if (timeframe === "long-term") {
    if (
      bullish &&
      entryQuality.quality === "Stretched"
    ) {
      return {
        action: "WAIT FOR PULLBACK",
        reason:
          "The long-term outlook is bullish, but the current price is stretched enough to reduce immediate entry quality.",
      };
    }

    if (
      bullish &&
      (entryQuality.quality === "Discounted" ||
        entryQuality.quality === "Attractive")
    ) {
      return {
        action: "ACCUMULATE",
        reason:
          "The long-term outlook is bullish and current price positioning is favorable for gradual accumulation.",
      };
    }

    if (
      bullish &&
      entryQuality.quality === "Fair" &&
      finalScore >= 65
    ) {
      return {
        action: "ACCUMULATE",
        reason:
          "The long-term structure is constructive and the current entry is reasonable for gradual accumulation.",
      };
    }

    if (bearish) {
      return {
        action: "AVOID",
        reason:
          "The long-term structure is bearish, so Theo does not favor adding fresh long exposure.",
      };
    }

    return {
      action: "HOLD / WAIT",
      reason:
        "Long-term conditions are not sufficiently aligned for aggressive accumulation.",
    };
  }

  if (timeframe === "swing") {
    if (
      bullish &&
      finalScore >= 65 &&
      entryQuality.quality !== "Stretched"
    ) {
      return {
        action: "BUY NOW",
        reason:
          "Swing structure, trade economics and entry quality are sufficiently aligned for an actionable setup.",
      };
    }

    if (
      bullish &&
      entryQuality.quality === "Stretched"
    ) {
      return {
        action: "WAIT FOR PULLBACK",
        reason:
          "The swing outlook is constructive, but current price extension makes patience preferable to chasing.",
      };
    }

    if (bearish) {
      return {
        action: "AVOID",
        reason:
          "Swing structure is bearish and does not support a fresh long entry.",
      };
    }

    return {
      action: "WAIT",
      reason:
        "The swing setup lacks enough combined confirmation for a fresh entry.",
    };
  }

  if (timeframe === "day") {
    if (
      bullish &&
      finalScore >= 70 &&
      (entryQuality.quality === "Attractive" ||
        entryQuality.quality === "Discounted" ||
        entryQuality.quality === "Fair") &&
      rrEvaluation.quality !== "Mixed"
    ) {
      return {
        action: "BUY NOW",
        reason:
          "Short-term structure, entry quality and risk/reward are sufficiently aligned for an actionable long setup.",
      };
    }

    if (
      bullish &&
      (entryQuality.quality === "Stretched" ||
        entryQuality.quality === "Chasing")
    ) {
      return {
        action: "WAIT FOR PULLBACK",
        reason:
          "Short-term conditions may be constructive, but the current price is too extended for a disciplined entry.",
      };
    }

    if (bearish) {
      return {
        action: "AVOID",
        reason:
          "Short-term structure is bearish and does not support a fresh long trade.",
      };
    }

    return {
      action: "WAIT",
      reason:
        "Day-trading conditions do not provide enough confirmation for an immediate entry.",
    };
  }

  return {
    action: "WAIT",
    reason:
      "Conditions are not sufficiently aligned for an immediate action.",
  };
}

/*
  v1.4 POSITION SIZING ENGINE

  Risk percentage = maximum planned account loss
  if invalidation is reached.

  Position percentage answers:
  "What percentage of trading capital can be deployed
  while respecting that loss budget?"
*/

function getSetupMultiplier({
  finalScore,
  confidence,
  rrQuality,
  entryQuality,
}) {
/*
   * v1.5 ADAPTIVE RISK ENGINE
   *
   * Higher risk must be earned by alignment.
   * A BUY NOW signal alone is not enough.
   *
   * Weak         = 0.50x base risk
   * Moderate     = 0.75x base risk
   * Strong       = 1.00x base risk
   * Very Strong  = 1.40x base risk
   * Exceptional  = 2.00x base risk
   *
   * The final account risk is still capped
   * by the timeframe's hard maxRiskPct.
   */

  let multiplier = 0.5;
  let setupStrength = "Weak";

  const strongRR =
    rrQuality === "Strong" ||
    rrQuality === "Good";

  const excellentRR =
    rrQuality === "Strong";

  const goodEntry =
    entryQuality === "Discounted" ||
    entryQuality === "Attractive" ||
    entryQuality === "Fair";

  const excellentEntry =
    entryQuality === "Discounted" ||
    entryQuality === "Attractive";

  /*
   * EXCEPTIONAL
   *
   * Requires very high score, high confidence,
   * strong R:R and an advantageous entry.
   *
   * This is the only tier allowed to approach
   * the full aggressive-risk ceiling.
   */
  if (
    finalScore >= 88 &&
    confidence === "High" &&
    excellentRR &&
    excellentEntry
  ) {
    multiplier = 2.0;
    setupStrength = "Exceptional";
  }

  /*
   * VERY STRONG
   *
   * Strong overall alignment without requiring
   * every exceptional condition.
   */
  else if (
    finalScore >= 80 &&
    confidence === "High" &&
    strongRR &&
    goodEntry
  ) {
    multiplier = 1.4;
    setupStrength = "Very Strong";
  }

  /*
   * STRONG
   */
  else if (
    finalScore >= 70 &&
    strongRR &&
    goodEntry
  ) {
    multiplier = 1.0;
    setupStrength = "Strong";
  }

  /*
   * MODERATE
   */
  else if (
    finalScore >= 65
  ) {
    multiplier = 0.75;
    setupStrength = "Moderate";
  }

  return {
    multiplier,
    setupStrength,
  };
}

function calculateTradingPosition({
  timeframe,
  action,
  finalScore,
  confidence,
  rrQuality,
  entryQuality,
  entryPrice,
  invalidation,
}) {
  if (action !== "BUY NOW") {
    return {
      enabled: false,
      setupStrength: "No Trade",
      riskPct: 0,
      positionPct: 0,
      stopDistancePct: 0,
      explanation:
        "Theo does not allocate trading capital unless the current action is BUY NOW.",
    };
  }

  const riskConfig = RISK_PROFILE[timeframe];

  const setup = getSetupMultiplier({
    finalScore,
    confidence,
    rrQuality,
    entryQuality,
  });

  let riskPct =
    riskConfig.baseRiskPct * setup.multiplier;

  riskPct = Math.min(
    riskPct,
    riskConfig.maxRiskPct
  );

  const stopDistancePct =
    entryPrice > 0
      ? (Math.abs(entryPrice - invalidation) /
          entryPrice) *
        100
      : 0;

  let positionPct =
    stopDistancePct > 0
      ? (riskPct / stopDistancePct) * 100
      : 0;

  /*
    No leverage in v1.4.
    Therefore position size cannot exceed 100%
    of dedicated trading capital.
  */

  positionPct = clamp(positionPct, 0, 100);

  return {
    enabled: true,
    setupStrength: setup.setupStrength,
    setupMultiplier: setup.multiplier,
    riskPct: round(riskPct),
    positionPct: round(positionPct),
    stopDistancePct: round(stopDistancePct),
    explanation:
      `Theo allows approximately ${round(
        riskPct
      )}% account risk for this ${setup.setupStrength.toLowerCase()} ${timeframe} setup. ` +
      `With invalidation approximately ${round(
        stopDistancePct
      )}% from the planned entry, the unleveraged position ceiling is approximately ${round(
        positionPct
      )}% of dedicated trading capital.`,
  };
}

/*
  LONG-TERM ALLOCATION ENGINE

  This is deliberately separate from short-term
  stop-loss-based position sizing.
*/

function calculateLongTermAllocation({
  action,
  outlook,
  finalScore,
  entryQuality,
}) {
  if (action !== "ACCUMULATE") {
    return {
      enabled: false,
      allocationPct: 0,
      allocationStrength: "No New Allocation",
      explanation:
        "Theo is not recommending fresh long-term accumulation at the current price.",
    };
  }

  let allocationPct =
    RISK_PROFILE.longTerm.baseAllocationPct;

  let allocationStrength = "Measured";

  if (
    outlook === "STRONGLY BULLISH" &&
    finalScore >= 80 &&
    (entryQuality === "Discounted" ||
      entryQuality === "Attractive")
  ) {
    allocationPct =
      RISK_PROFILE.longTerm.maxAllocationPct;

    allocationStrength = "Aggressive";
  } else if (
    outlook === "STRONGLY BULLISH" ||
    finalScore >= 75
  ) {
    allocationPct =
      RISK_PROFILE.longTerm.strongAllocationPct;

    allocationStrength = "Strong";
  }

  return {
    enabled: true,
    allocationPct,
    allocationStrength,
    explanation:
      `Theo recommends a ${allocationStrength.toLowerCase()} accumulation tranche of approximately ${allocationPct}% of capital reserved for new long-term crypto purchases. Core holdings remain separate from trading capital.`,
  };
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "1.4",
    engine:
      "Theo Capital Protection + Aggressive Position Sizing Engine",
    riskProfile: RISK_PROFILE.name,
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

    const [marketResponse, historyResponse] =
      await Promise.all([
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
            .map((item) => Number(item?.[1]))
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

    const change7d = percentChange(
      currentPrice,
      sevenDaysAgo
    );

    const change30d = percentChange(
      currentPrice,
      thirtyDaysAgo
    );

    /*
      TECHNICAL OUTLOOK SCORE
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

    technicalScore = Math.round(
      clamp(technicalScore, 0, 100)
    );

    const outlook =
      getOutlook(technicalScore);

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
      TRADE STRUCTURE
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

    const rrEvaluation =
      evaluateRiskReward(
        rr1,
        rr2,
        config.minRR
      );

    const entryQuality =
      evaluateEntryQuality({
        price: currentPrice,
        fastSMA,
        recentHigh,
        recentLow,
        rsi,
        timeframe,
      });

    let finalScore =
      technicalScore +
      rrEvaluation.adjustment +
      entryQuality.adjustment;

    finalScore = Math.round(
      clamp(finalScore, 0, 100)
    );

    const actionDecision =
      determineAction({
        timeframe,
        outlook,
        finalScore,
        rrEvaluation,
        entryQuality,
        rr2,
        minimumRR: config.minRR,
      });

    const confidence =
      getConfidence(technicalScore);

    const entryProgress =
      calculateEntryProgress(
        currentPrice,
        entryLow,
        entryHigh
      );

    /*
      v1.4 CAPITAL ENGINE
    */

    let capitalPlan;

    if (timeframe === "long-term") {
      capitalPlan =
        calculateLongTermAllocation({
          action:
            actionDecision.action,
          outlook,
          finalScore,
          entryQuality:
            entryQuality.quality,
        });
    } else {
      capitalPlan =
        calculateTradingPosition({
          timeframe,
          action:
            actionDecision.action,
          finalScore,
          confidence,
          rrQuality:
            rrEvaluation.quality,
          entryQuality:
            entryQuality.quality,
          entryPrice:
            entryMidpoint,
          invalidation,
        });
    }

    return NextResponse.json({
      ok: true,
      symbol,
      timeframe,
      live: true,
      source: "CoinGecko",
      version: "1.4",

      riskProfile: {
        name: RISK_PROFILE.name,
        philosophy:
          "Aggressive upside seeking with predefined downside and protected core capital.",
        leverage: false,
      },

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
        outlook,

        action:
          actionDecision.action,

        technicalScore,
        finalScore,
        confidence,

        outlookReason:
          `Theo's ${timeframe} market outlook is ${outlook.toLowerCase()} based on trend, momentum, price structure and volatility.`,

        actionReason:
          actionDecision.reason,

        trend,
        momentum,
        risk,

        entryProgress:
          round(entryProgress, 0),

        entryQuality: {
          quality:
            entryQuality.quality,

          scoreAdjustment:
            entryQuality.adjustment,

          explanation:
            entryQuality.explanation,

          distanceFromFastSMA:
            round(
              entryQuality.distanceFromFastSMA
            ),

          recentRangePosition:
            round(
              entryQuality.rangePosition,
              0
            ),
        },

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

        capitalPlan,
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
        `${symbol} ${timeframe} outlook: ${outlook}. ` +
        `Action: ${actionDecision.action}. ` +
        `Technical score ${technicalScore}/100. ` +
        `Action score ${finalScore}/100. ` +
        `Risk profile: ${RISK_PROFILE.name}. ` +
        capitalPlan.explanation,

      framework: [
        `Market outlook: ${outlook}.`,

        `Recommended action: ${actionDecision.action}.`,

        `Technical outlook score: ${technicalScore}/100.`,

        `Final action score: ${finalScore}/100.`,

        `Entry quality: ${entryQuality.quality}.`,

        `Risk/reward quality: ${rrEvaluation.quality}.`,

        `Risk profile: ${RISK_PROFILE.name}.`,

        capitalPlan.explanation,

        "Higher risk is permitted only when setup quality supports it.",

        "WAIT, WAIT FOR PULLBACK and AVOID receive no fresh trading allocation.",

        "Long-term capital and short-term trading capital are evaluated separately.",

        "No leverage is used in the v1.4 sizing model.",

        "Invalidation defines the planned downside boundary, not a guarantee of execution price.",

        "Position sizing is designed to control loss before optimizing gain.",

        "Core long-term holdings should not be used to fund speculative short-term trades.",

        "Avoid increasing size to recover previous losses.",
      ],
    });
  } catch (error) {
    console.error(
      "Theo v1.4 analysis error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to complete Theo Capital Protection analysis.",
      },
      { status: 500 }
    );
  }
}