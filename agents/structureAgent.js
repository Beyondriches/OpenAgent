export function evaluateStructure({
  historicalPrices,
}) {
  if (
    !Array.isArray(historicalPrices) ||
    historicalPrices.length < 10
  ) {
    return {
      structure: "Unknown",
      score: 0,
      signals: ["Insufficient price history to evaluate market structure."],
    };
  }

  const recentPrices =
    historicalPrices.slice(-20);

  const midpoint =
    Math.floor(recentPrices.length / 2);

  const earlierPrices =
    recentPrices.slice(0, midpoint);

  const laterPrices =
    recentPrices.slice(midpoint);

  const earlierHigh =
    Math.max(...earlierPrices);

  const earlierLow =
    Math.min(...earlierPrices);

  const laterHigh =
    Math.max(...laterPrices);

  const laterLow =
    Math.min(...laterPrices);

  const higherHigh =
    laterHigh > earlierHigh;

  const higherLow =
    laterLow > earlierLow;

  const lowerHigh =
    laterHigh < earlierHigh;

  const lowerLow =
    laterLow < earlierLow;

  let structure = "Mixed";
  let score = 0;
  const signals = [];

  if (higherHigh && higherLow) {
    structure = "Bullish";
    score = 2;
    signals.push(
      "Recent price action shows a higher high and higher low."
    );
  } else if (lowerHigh && lowerLow) {
    structure = "Bearish";
    score = -2;
    signals.push(
      "Recent price action shows a lower high and lower low."
    );
  } else {
    structure = "Mixed";
    score = 0;
    signals.push(
      "Recent highs and lows do not confirm a clear directional structure."
    );
  }

  return {
    structure,
    score,
    earlierHigh,
    earlierLow,
    laterHigh,
    laterLow,
    signals,
  };
}
