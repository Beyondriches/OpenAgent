  export function getOutlook(technicalScore) {
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