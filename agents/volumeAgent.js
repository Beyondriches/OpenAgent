export function evaluateVolume({
  historicalVolumes,
}) {
  if (
    !Array.isArray(historicalVolumes) ||
    historicalVolumes.length < 2
  ) {
    return {
      volume: "Unknown",
      score: 0,
      ratio: null,
      signals: ["Insufficient historical volume data."],
    };
  }

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

  const ratio =
    averageVolume > 0
      ? currentVolume / averageVolume
      : 1;

  let volume = "Normal";
  let score = 0;
  const signals = [];

  if (ratio >= 1.5) {
    volume = "High";
    score = 2;
    signals.push(
      "Current volume is significantly above its recent average."
    );
  } else if (ratio < 0.7) {
    volume = "Low";
    score = -2;
    signals.push(
      "Current volume is significantly below its recent average."
    );
  } else {
    signals.push(
      "Current volume is near its recent average."
    );
  }

  return {
    volume,
    score,
    ratio,
    currentVolume,
    averageVolume,
    signals,
  };
}
