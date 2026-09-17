export function evaluateOrchestration({
  mode,
  momentumAgent,
  trendAgent,
  volatilityAgent,
  volumeAgent,
  liquidityAgent,
  structureAgent,
  searchAgent,
  dataAnalysisAgent,
  regimeAgent,
  compareAgent,
}) {
  const observations = [];
  let confidenceScore = 50;

  /*
    DIRECTIONAL EVIDENCE
  */

  let bullishEvidence = 0;
  let bearishEvidence = 0;

  const weights = {
  momentum: 1,
  trend: 2,
  structure: 2,
  search: 1,
};

if (mode === "day") {
  weights.momentum = 2;
  weights.trend = 1;
  weights.structure = 2;
} else if (mode === "swing") {
  weights.momentum = 2;
  weights.trend = 2;
  weights.structure = 2;
} else if (mode === "long-term") {
  weights.momentum = 1;
  weights.trend = 4;
  weights.structure = 1;
}

  if (momentumAgent?.momentum === "Bullish") {
    bullishEvidence += weights.momentum;
  } else if (
    momentumAgent?.momentum === "Bearish"
  ) {
    bearishEvidence += weights.momentum;
  }

  if (trendAgent?.trend === "Bullish") {
    bullishEvidence += weights.trend;
  } else if (
    trendAgent?.trend === "Bearish"
  ) {
    bearishEvidence += weights.trend;
  }

  if (structureAgent?.structure === "Bullish") {
    bullishEvidence += weights.structure;
  } else if (
    structureAgent?.structure === "Bearish"
  ) {
    bearishEvidence += weights.structure;
  }

  /*
    SEARCH EVIDENCE
  */

  if (
    searchAgent?.confidence === "High" ||
    searchAgent?.confidence === "Medium"
  ) {
    if (searchAgent.sentiment === "Positive") {
      bullishEvidence += weights.search;
    } else if (
      searchAgent.sentiment === "Negative"
    ) {
      bearishEvidence += weights.search;
    }
  }

  /*
    CROSS-VALIDATION
  */

  if (compareAgent?.confidence === "High") {
    confidenceScore += 15;
  } else if (
    compareAgent?.confidence === "Medium"
  ) {
    confidenceScore += 7;
  } else {
    confidenceScore -= 10;
  }

  if (compareAgent?.agreement === "Strong") {
    confidenceScore += 10;
  } else if (
    compareAgent?.agreement === "Mixed"
  ) {
    confidenceScore -= 5;
  }

  /*
    MARKET ENVIRONMENT
  */

  if (regimeAgent?.regime === "Trending") {
    confidenceScore += 8;
    observations.push(
      "Trending market regime supports directional analysis."
    );
  }

  if (regimeAgent?.regime === "Volatile") {
    confidenceScore -= 15;
    observations.push(
      "Volatile market regime reduces orchestration confidence."
    );
  }

  if (volatilityAgent?.volatility === "High") {
    confidenceScore -= 10;
    observations.push(
      "High volatility increases execution uncertainty."
    );
  }

  if (liquidityAgent?.liquidity === "High") {
    confidenceScore += 5;
  } else if (
    liquidityAgent?.liquidity === "Low"
  ) {
    confidenceScore -= 10;
    observations.push(
      "Low liquidity increases execution risk."
    );
  }

  if (volumeAgent?.volume === "High") {
    confidenceScore += 5;
  } else if (
    volumeAgent?.volume === "Low"
  ) {
    confidenceScore -= 5;
  }

  /*
    STATISTICAL QUALITY
  */

  if (
    dataAnalysisAgent?.behaviour === "Abnormal"
  ) {
    confidenceScore -= 15;
    observations.push(
      "Abnormal statistical behaviour reduces confidence."
    );
  }

  if (
    dataAnalysisAgent?.trendConsistency ===
    "High"
  ) {
    confidenceScore += 5;
  }

  /*
    DIRECTION
  */

  let direction = "Neutral";

  if (
    bullishEvidence >
    bearishEvidence
  ) {
    direction = "Bullish";
  } else if (
    bearishEvidence >
    bullishEvidence
  ) {
    direction = "Bearish";
  }

  const evidenceDifference =
    Math.abs(
      bullishEvidence -
      bearishEvidence
    );

  if (evidenceDifference >= 4) {
    confidenceScore += 10;
  } else if (evidenceDifference <= 1) {
    confidenceScore -= 10;
  }

  /*
    KEEP CONFIDENCE INSIDE 0–100
  */

  confidenceScore = Math.max(
    0,
    Math.min(100, confidenceScore)
  );

  let confidence = "Low";

  if (confidenceScore >= 75) {
    confidence = "High";
  } else if (confidenceScore >= 55) {
    confidence = "Medium";
  }

  observations.push(
    `Bullish evidence weight: ${bullishEvidence}.`
  );

  observations.push(
    `Bearish evidence weight: ${bearishEvidence}.`
  );

  /*
    IMPORTANT:
    This agent is observational only.
    It does not issue BUY or SELL instructions.
  */

  return {
    direction,
    confidence,
    confidenceScore,
    bullishEvidence,
    bearishEvidence,
    mode,
    weights,
    observations,
  };
}
