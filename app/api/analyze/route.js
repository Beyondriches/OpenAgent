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
  if (!values?.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values) {
  if (!values?.length) return 0;

  const mean = average(values);

  const variance =
    values.reduce(
      (sum, value) => sum + Math.pow(value - mean, 2),
      0
    ) / values.length;

  return Math.sqrt(variance);
}

function calculateRSI(prices, period = 14) {
  if (!prices || prices.length < period + 1) return null;

  const changes = [];

  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const recent = changes.slice(-period);

  let gains = 0;
  let losses = 0;

  for (const change of recent) {
    if (change > 0) gains += change;
    if (change < 0) losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;

  return 100 - 100 / (1 + rs);
}

function calculateEMA(values, period) {
  if (!values || values.length < period) return null;

  const multiplier = 2 / (period + 1);

  let ema = average(values.slice(0, period));

  for (let i = period; i < values.length; i++) {
    ema = values[i] * multiplier + ema * (1 - multiplier);
  }

  return ema;
}

function calculateEMASeries(values, period) {
  if (!values || values.length < period) return [];

  const multiplier = 2 / (period + 1);
  const series = [];

  let ema = average(values.slice(0, period));

  series.push(ema);

  for (let i = period; i < values.length; i++) {
    ema = values[i] * multiplier + ema * (1 - multiplier);
    series.push(ema);
  }

  return series;
}

function calculateMACD(prices) {
  if (!prices || prices.length < 35) {
    return {
      macd: null,
      signal: null,
      histogram: null,
    };
  }

  const ema12Series = calculateEMASeries(prices, 12);
  const ema26Series = calculateEMASeries(prices, 26);

  const offset = ema12Series.length - ema26Series.length;

  const macdSeries = ema26Series.map(
    (ema26, index) => ema12Series[index + offset] - ema26
  );

  if (macdSeries.length < 9) {
    return {
      macd: macdSeries.at(-1) ?? null,
      signal: null,
      histogram: null,
    };
  }

  const signalSeries = calculateEMASeries(macdSeries, 9);

  const macd = macdSeries.at(-1);
  const signal = signalSeries.at(-1);

  return {
    macd,
    signal,
    histogram:
      macd !== null && signal !== null ? macd - signal : null,
  };
}

function calculateVolatility(prices) {
  if (!prices || prices.length < 2) return 0;

  const returns = [];

  for (let i = 1; i < prices.length; i++) {
    returns.push(
      ((prices[i] - prices[i - 1]) / prices[i - 1]) * 100
    );
  }

  return standardDeviation(returns);
}

function round(value, decimals = 2) {
  if (value === null || value === undefined) return null;

  return Number(Number(value).toFixed(decimals));
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Theo Crypto Agent",
    version: "0.8",
    engine: "Theo Multi-Indicator Engine",
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

    const marketUrl =
      "https://api.coingecko.com/api/v3/coins/markets" +
      `?vs_currency=usd&ids=${coinId}` +
      "&price_change_percentage=24h,7d,30d";

    const marketResponse = await fetch(marketUrl, {
      headers: { accept: "application/json" },
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
      Fetch 90 days so MACD has enough history.
    */

    const chartUrl =
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart` +
      "?vs_currency=usd&days=90&interval=daily";

    const chartResponse = await fetch(chartUrl, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });

    if (!chartResponse.ok) {
      throw new Error(
        `CoinGecko chart request returned ${chartResponse.status}`
      );
    }

    const chartData = await chartResponse.json();

    const prices = (chartData.prices || [])
      .map((item) => Number(item[1]))
      .filter(Number.isFinite);

    if (prices.length < 35) {
      throw new Error("Not enough historical price data.");
    }

    const currentPrice = Number(coin.current_price);

    /*
      Moving averages
    */

    const sma7 = average(prices.slice(-7));
    const sma14 = average(prices.slice(-14));
    const sma30 = average(prices.slice(-30));

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);

    /*
      RSI
    */

    const rsi = calculateRSI(prices, 14);

    /*
      MACD
    */

    const macdData = calculateMACD(prices);

    /*
      Bollinger Bands
    */

    const bollingerPrices = prices.slice(-20);
    const bollingerMiddle = average(bollingerPrices);
    const bollingerDeviation = standardDeviation(bollingerPrices);

    const bollingerUpper =
      bollingerMiddle + bollingerDeviation * 2;

    const bollingerLower =
      bollingerMiddle - bollingerDeviation * 2;

    const bollingerWidth =
      bollingerMiddle > 0
        ? ((bollingerUpper - bollingerLower) /
            bollingerMiddle) *
          100
        : 0;

    let bollingerPosition = "Middle";

    if (currentPrice >= bollingerUpper) {
      bollingerPosition = "Above Upper";
    } else if (currentPrice <= bollingerLower) {
      bollingerPosition = "Below Lower";
    } else if (currentPrice > bollingerMiddle) {
      bollingerPosition = "Upper Half";
    } else if (currentPrice < bollingerMiddle) {
      bollingerPosition = "Lower Half";
    }

    /*
      Volatility and market changes
    */

    const volatility = calculateVolatility(prices.slice(-14));

    const change24 =
      Number(coin.price_change_percentage_24h) || 0;

    const change7 =
      Number(coin.price_change_percentage_7d_in_currency) || 0;

    const change30 =
      Number(coin.price_change_percentage_30d_in_currency) || 0;

    /*
      Trend
    */

    let trend = "Neutral";

    if (
      currentPrice > sma7 &&
      sma7 > sma14 &&
      sma14 > sma30 &&
      ema12 > ema26
    ) {
      trend = "Bullish";
    }

    if (
      currentPrice < sma7 &&
      sma7 < sma14 &&
      sma14 < sma30 &&
      ema12 < ema26
    ) {
      trend = "Bearish";
    }

    /*
      Momentum
    */

    let momentum = "Neutral";

    if (rsi !== null) {
      if (
        rsi >= 55 &&
        change7 > 0 &&
        macdData.histogram !== null &&
        macdData.histogram > 0
      ) {
        momentum = "Positive";
      }

      if (
        rsi <= 45 &&
        change7 < 0 &&
        macdData.histogram !== null &&
        macdData.histogram < 0
      ) {
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
      Risk
    */

    let risk = "Medium";

    if (volatility >= 5 || bollingerWidth >= 25) {
      risk = "High";
    } else if (volatility < 2.5 && bollingerWidth < 15) {
      risk = "Low";
    }

    /*
      Theo Score v0.8
    */

    let score = 50;

    if (trend === "Bullish") score += 15;
    if (trend === "Bearish") score -= 15;

    if (currentPrice > sma30) score += 5;
    if (currentPrice < sma30) score -= 5;

    if (ema12 !== null && ema26 !== null) {
      if (ema12 > ema26) score += 7;
      if (ema12 < ema26) score -= 7;
    }

    if (
      macdData.macd !== null &&
      macdData.signal !== null
    ) {
      if (macdData.macd > macdData.signal) score += 8;
      if (macdData.macd < macdData.signal) score -= 8;
    }

    if (macdData.histogram !== null) {
      if (macdData.histogram > 0) score += 4;
      if (macdData.histogram < 0) score -= 4;
    }

    if (momentum === "Positive") score += 10;
    if (momentum === "Negative") score -= 10;

    if (rsi !== null) {
      if (rsi >= 50 && rsi < 65) score += 4;
      if (rsi > 35 && rsi < 50) score -= 4;

      if (rsi <= 30) score += 5;
      if (rsi >= 70) score -= 8;
    }

    if (change24 > 0) score += 2;
    if (change24 < 0) score -= 2;

    if (change7 > 5) score += 4;
    if (change7 < -5) score -= 4;

    if (
      currentPrice > bollingerMiddle &&
      currentPrice < bollingerUpper
    ) {
      score += 3;
    }

    if (currentPrice > bollingerUpper) {
      score -= 5;
    }

    if (risk === "High") score -= 5;

    score = Math.max(0, Math.min(100, Math.round(score)));

    /*
      Verdict
    */

    let verdict = "WAIT";

    if (
      score >= 70 &&
      trend !== "Bearish" &&
      momentum !== "Overbought" &&
      macdData.histogram !== null &&
      macdData.histogram > 0
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
      Entry / risk references
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
      entryLow = Math.min(currentPrice, bollingerMiddle);
      entryHigh = currentPrice * 1.005;
      invalidation = Math.min(
        currentPrice * 0.975,
        bollingerLower
      );
      target1 = currentPrice * 1.025;
      target2 = currentPrice * 1.05;
    } else if (timeframe === "long-term") {
      entryLow = Math.min(
        currentPrice,
        sma30,
        bollingerMiddle
      );

      entryHigh = Math.max(
        Math.min(currentPrice, sma30),
        entryLow
      );

      invalidation = recentLow * 0.85;
      target1 = currentPrice * 1.2;
      target2 = currentPrice * 1.4;
    } else {
      entryLow = Math.min(
        currentPrice,
        recentAverage,
        bollingerMiddle
      );

      entryHigh = Math.max(
        currentPrice,
        recentAverage
      );

      invalidation = Math.min(
        recentLow * 0.94,
        bollingerLower
      );

      target1 = currentPrice * 1.1;
      target2 = currentPrice * 1.18;
    }

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
        rsi14: round(rsi, 1),

        sma7: round(sma7),
        sma14: round(sma14),
        sma30: round(sma30),

        ema12: round(ema12),
        ema26: round(ema26),

        macd: round(macdData.macd, 4),
        macdSignal: round(macdData.signal, 4),
        macdHistogram: round(macdData.histogram, 4),

        bollingerUpper: round(bollingerUpper),
        bollingerMiddle: round(bollingerMiddle),
        bollingerLower: round(bollingerLower),
        bollingerWidth: round(bollingerWidth),
        bollingerPosition,

        volatility14d: round(volatility),

        recentHigh: round(recentHigh),
        recentLow: round(recentLow),
      },

      analysis: {
        verdict,
        score,
        trend,
        momentum,
        risk,

        periodChange: round(change7),
        range24h: round(range24),
        recentAverage: round(recentAverage),

        entryZone: {
          low: round(entryLow),
          high: round(entryHigh),
        },

        invalidation: round(invalidation),

        targets: [
          round(target1),
          round(target2),
        ],
      },

      summary:
        `${symbol} ${timeframe} analysis: ${verdict}. ` +
        `Theo score ${score}/100. ` +
        `Trend is ${trend.toLowerCase()}, ` +
        `momentum is ${momentum.toLowerCase()}, ` +
        `RSI ${rsi === null ? "N/A" : rsi.toFixed(1)}, ` +
        `MACD histogram ${
          macdData.histogram === null
            ? "N/A"
            : macdData.histogram.toFixed(2)
        }, with ${risk.toLowerCase()} risk.`,

      framework: [
        `Theo score: ${score}/100.`,
        `RSI (14): ${rsi === null ? "N/A" : rsi.toFixed(1)}.`,
        `EMA 12: $${ema12?.toFixed(2) ?? "N/A"}.`,
        `EMA 26: $${ema26?.toFixed(2) ?? "N/A"}.`,
        `MACD: ${macdData.macd?.toFixed(2) ?? "N/A"}.`,
        `MACD signal: ${macdData.signal?.toFixed(2) ?? "N/A"}.`,
        `MACD histogram: ${macdData.histogram?.toFixed(2) ?? "N/A"}.`,
        `Bollinger position: ${bollingerPosition}.`,
        `Bollinger width: ${bollingerWidth.toFixed(2)}%.`,
        `Trend: ${trend}.`,
        `Momentum: ${momentum}.`,
        `Risk level: ${risk}.`,
        "Signals combine multiple indicators and are not guarantees of future price movement.",
        "Treat entry zones, invalidation and targets as mechanical research references.",
        "Keep long-term core capital separate from speculative trading capital.",
        "Avoid FOMO entries after sharp price moves.",
      ],
    });
  } catch (error) {
    console.error("Theo v0.8 analysis error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to complete live technical analysis.",
      },
      { status: 500 }
    );
  }
}