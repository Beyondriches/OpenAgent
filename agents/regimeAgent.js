export function evaluateRegime({
  historicalPrices,
  currentPrice,
  fastSMA,
  slowSMA,
}) {
  if (
    !Array.isArray(historicalPrices) ||
    historicalPrices.length < 10 ||
    !Number.isFinite(currentPrice) ||
    !Number.isFinite(fastSMA) ||
    !Number.isFinite(slowSMA) ||
    currentPrice <= 0
  ) {
    return {
      regime: "Unknown",
      score: 0,
      averageMove: null,
      trendSpread: null,
      signals: [
        "Insufficient data to evaluate market regime.",
      ],
    };
  }

  const recentPrices =
    historicalPrices.slice(-30);

  const returns = [];

  for (
    let i = 1;
    i < recentPrices.length;
    i++
  ) {
    const previous =
      recentPrices[i - 1];

    const current =
      recentPrices[i];

    if (previous > 0) {
      returns.push(
        ((current - previous) / previous) * 100
      );
    }
  }

  const averageMove =
    returns.length > 0
      ? returns.reduce(
          (sum, value) =>
            sum + Math.abs(value),
          0
        ) / returns.length
      : 0;

  const trendSpread =
    (
      Math.abs(fastSMA - slowSMA) /
      currentPrice
    ) * 100;

  let regime = "Ranging";
  let score = 0;
  const signals = [];

  if (averageMove >= 3.5) {
    regime = "Volatile";
    score = -2;

    signals.push(
      "Recent daily price movement indicates a volatile market regime."
    );
  } else if (trendSpread >= 2) {
    regime = "Trending";
    score = 2;

    signals.push(
      "Moving-average separation indicates a trending market regime."
    );
  } else if (averageMove < 1.5) {
    regime = "Quiet";
    score = -1;

    signals.push(
      "Recent price movement indicates a quiet market regime."
    );
  } else {
    regime = "Ranging";
    score = 0;

    signals.push(
      "Price movement and moving-average separation indicate a ranging market regime."
    );
  }

  return {
    regime,
    score,
    averageMove,
    trendSpread,
    signals,
  };
}
