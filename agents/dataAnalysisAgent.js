export function evaluateDataAnalysis({
  historicalPrices,
  historicalVolumes,
  currentPrice,
}) {
  if (
    !Array.isArray(historicalPrices) ||
    historicalPrices.length < 10 ||
    !Number.isFinite(currentPrice)
  ) {
    return {
      behaviour: "Unknown",
      trendConsistency: "Unknown",
      volumeConfirmation: "Unknown",
      anomaly: "Unknown",
      confidence: "Low",
      observations: [
        "Insufficient data for broader statistical analysis.",
      ],
    };
  }

  const recentPrices = historicalPrices.slice(-30);

  const returns = [];

  for (let i = 1; i < recentPrices.length; i++) {
    const previousPrice = recentPrices[i - 1];
    const price = recentPrices[i];

    if (previousPrice > 0) {
      returns.push(
        ((price - previousPrice) / previousPrice) * 100
      );
    }
  }

  const averageReturn =
    returns.reduce(
      (sum, value) => sum + value,
      0
    ) / returns.length;

  const averageAbsoluteReturn =
    returns.reduce(
      (sum, value) => sum + Math.abs(value),
      0
    ) / returns.length;

  const positiveReturns =
    returns.filter(
      (value) => value > 0
    ).length;

  const negativeReturns =
    returns.filter(
      (value) => value < 0
    ).length;

  const consistencyRatio =
    Math.max(
      positiveReturns,
      negativeReturns
    ) / returns.length;

  let trendConsistency = "Mixed";

  if (consistencyRatio >= 0.7) {
    trendConsistency = "High";
  } else if (consistencyRatio >= 0.55) {
    trendConsistency = "Moderate";
  }

  let behaviour = "Normal";
  let anomaly = "None";

  const latestReturn =
    returns[returns.length - 1];

  if (
    Math.abs(latestReturn) >
    averageAbsoluteReturn * 2.5
  ) {
    behaviour = "Abnormal";
    anomaly = "Large recent price move";
  }

  let volumeConfirmation = "Unknown";

  if (
    Array.isArray(historicalVolumes) &&
    historicalVolumes.length >= 10
  ) {
    const recentVolumes =
      historicalVolumes.slice(-30);

    const currentVolume =
      recentVolumes[recentVolumes.length - 1];

    const previousVolumes =
      recentVolumes.slice(0, -1);

    const averageVolume =
      previousVolumes.reduce(
        (sum, value) => sum + value,
        0
      ) / previousVolumes.length;

    if (averageVolume > 0) {
      const volumeRatio =
        currentVolume / averageVolume;

      if (volumeRatio >= 1.2) {
        volumeConfirmation = "Strong";
      } else if (volumeRatio < 0.8) {
        volumeConfirmation = "Weak";
      } else {
        volumeConfirmation = "Normal";
      }
    }
  }

  const observations = [];

  observations.push(
    `Average daily return is ${averageReturn.toFixed(2)}%.`
  );

  observations.push(
    `Average absolute daily move is ${averageAbsoluteReturn.toFixed(2)}%.`
  );

  if (anomaly !== "None") {
    observations.push(
      "The latest price movement is unusually large relative to recent behaviour."
    );
  }

  if (volumeConfirmation === "Weak") {
    observations.push(
      "Recent trading volume provides weak confirmation of current price behaviour."
    );
  }

  const confidence =
    historicalPrices.length >= 30
      ? "High"
      : "Medium";

  return {
    behaviour,
    trendConsistency,
    volumeConfirmation,
    anomaly,
    confidence,
    averageReturn,
    averageAbsoluteReturn,
    latestReturn,
    observations,
  };
}
