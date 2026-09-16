export function evaluateMomentum({
  rsi,
  fastSMA,
  slowSMA,
  currentPrice,
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
    score += 1;
    signals.push("Fast moving average is above the slow moving average.");
  } else {
    score -= 1;
    signals.push("Fast moving average is below the slow moving average.");
  }

  if (rsi >= 55 && rsi <= 70) {
    score += 1;
    signals.push("RSI supports bullish momentum.");
  } else if (rsi < 40) {
    score -= 1;
    signals.push("RSI indicates weak momentum.");
  }

  if (change7d > 0) {
    score += 1;
    signals.push("Seven-day momentum is positive.");
  } else if (change7d < 0) {
    score -= 1;
    signals.push("Seven-day momentum is negative.");
  }

  if (change30d > 0) {
    score += 1;
    signals.push("Thirty-day momentum is positive.");
  } else if (change30d < 0) {
    score -= 1;
    signals.push("Thirty-day momentum is negative.");
  }

  let momentum = "Neutral";

  if (score >= 3) {
    momentum = "Bullish";
  } else if (score <= -3) {
    momentum = "Bearish";
  }

  return {
    momentum,
    score,
    signals,
  };
}