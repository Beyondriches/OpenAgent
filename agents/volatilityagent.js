export function evaluateVolatility({
  historicalPrices,
  currentPrice,
}) {
  if (
    !Array.isArray(historicalPrices) ||
    historicalPrices.length < 2
  ) {
    return {
      volatility: "Unknown",
      score: 0,
      percent: 0,
      signals: ["Insufficient price history."],
    };
  }

  const recentPrices =
    historicalPrices.slice(-30);

  const returns = [];

  for (let i = 1; i < recentPrices.length; i++) {
    const previous = recentPrices[i - 1];
    const current = recentPrices[i];

    if (previous > 0) {
      returns.push(
        ((current - previous) / previous) * 100
      );
    }
  }

  const averageMove =
    returns.reduce(
      (sum, value) => sum + Math.abs(value),
      0
    ) / returns.length;

  let volatility = "Moderate";
  let score = 0;
  const signals = [];

  if (averageMove < 1.5) {
    volatility = "Low";
    score = 2;
    signals.push(
      "Recent daily price movement is relatively stable."
    );
  } else if (averageMove < 3.5) {
    volatility = "Moderate";
    score = 0;
    signals.push(
      "Recent daily price movement shows moderate volatility."
    );
  } else {
    volatility = "High";
    score = -2;
    signals.push(
      "Recent daily price movement shows elevated volatility."
    );
  }

  return {
    volatility,
    score,
    percent: averageMove,
    currentPrice,
    signals,
  };
}
