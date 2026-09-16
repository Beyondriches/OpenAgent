export function evaluateTrend({
  currentPrice,
  fastSMA,
  slowSMA,
  change7d,
  change30d,
}) {
  let score = 0;
  const signals = [];

  if (currentPrice > fastSMA) {
    score += 1;
    signals.push("Price is above the fast moving average.");
  } else {
    score -= 1;
    signals.push("Price is below the fast moving average.");
  }

  if (fastSMA > slowSMA) {
    score += 2;
    signals.push("Fast moving average is above the slow moving average.");
  } else {
    score -= 2;
    signals.push("Fast moving average is below the slow moving average.");
  }

  if (change7d > 0) {
    score += 1;
    signals.push("Seven-day price trend is positive.");
  } else if (change7d < 0) {
    score -= 1;
    signals.push("Seven-day price trend is negative.");
  }

  if (change30d > 0) {
    score += 2;
    signals.push("Thirty-day price trend is positive.");
  } else if (change30d < 0) {
    score -= 2;
    signals.push("Thirty-day price trend is negative.");
  }

  let trend = "Neutral";

  if (score >= 3) {
    trend = "Bullish";
  } else if (score <= -3) {
    trend = "Bearish";
  }

  return {
    trend,
    score,
    signals,
  };
}