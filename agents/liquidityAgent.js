export function evaluateLiquidity({
  historicalVolumes,
  currentPrice,
}) {
  if (
    !Array.isArray(historicalVolumes) ||
    historicalVolumes.length < 2 ||
    !Number.isFinite(currentPrice)
  ) {
    return {
      liquidity: "Unknown",
      score: 0,
      estimatedTurnover: null,
      signals: ["Insufficient data to evaluate liquidity."],
    };
  }

  const recentVolumes =
    historicalVolumes.slice(-30);

  const averageVolume =
    recentVolumes.reduce(
      (sum, value) => sum + value,
      0
    ) / recentVolumes.length;

  const estimatedTurnover =
    averageVolume * currentPrice;

  let liquidity = "Moderate";
  let score = 0;
  const signals = [];

  if (estimatedTurnover >= 500000000) {
    liquidity = "High";
    score = 2;
    signals.push(
      "Estimated trading turnover indicates strong liquidity."
    );
  } else if (estimatedTurnover >= 50000000) {
    liquidity = "Moderate";
    score = 0;
    signals.push(
      "Estimated trading turnover indicates moderate liquidity."
    );
  } else {
    liquidity = "Low";
    score = -2;
    signals.push(
      "Estimated trading turnover indicates relatively low liquidity."
    );
  }

  return {
    liquidity,
    score,
    estimatedTurnover,
    signals,
  };
}
