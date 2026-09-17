export function evaluateComparison({
  momentumAgent,
  trendAgent,
  structureAgent,
  searchAgent,
  dataAnalysisAgent,
  regimeAgent,
}) {
  const signals = [];
  const bullishSignals = [];
  const bearishSignals = [];
  const neutralSignals = [];

  const classify = (
    name,
    value
  ) => {
    if (
      value === "Bullish" ||
      value === "Positive"
    ) {
      bullishSignals.push(name);
    } else if (
      value === "Bearish" ||
      value === "Negative"
    ) {
      bearishSignals.push(name);
    } else {
      neutralSignals.push(name);
    }
  };

  classify(
    "Momentum",
    momentumAgent?.momentum
  );

  classify(
    "Trend",
    trendAgent?.trend
  );

  classify(
    "Structure",
    structureAgent?.structure
  );

  if (
    searchAgent?.confidence !== "Low"
  ) {
    classify(
      "Search",
      searchAgent?.sentiment
    );
  } else {
    signals.push(
      "Search evidence was excluded from directional comparison because confidence is low."
    );
  }

  const directionalCount =
    bullishSignals.length +
    bearishSignals.length;

  let agreement = "Mixed";
  let direction = "Neutral";
  let confidence = "Low";

  if (
    bullishSignals.length >= 3 &&
    bearishSignals.length === 0
  ) {
    agreement = "Strong";
    direction = "Bullish";
    confidence = "High";
  } else if (
    bearishSignals.length >= 3 &&
    bullishSignals.length === 0
  ) {
    agreement = "Strong";
    direction = "Bearish";
    confidence = "High";
  } else if (
    bullishSignals.length >= 2 &&
    bullishSignals.length >
      bearishSignals.length
  ) {
    agreement = "Moderate";
    direction = "Bullish";
    confidence = "Medium";
  } else if (
    bearishSignals.length >= 2 &&
    bearishSignals.length >
      bullishSignals.length
  ) {
    agreement = "Moderate";
    direction = "Bearish";
    confidence = "Medium";
  } else if (
    directionalCount === 0
  ) {
    agreement = "Weak";
    direction = "Neutral";
    confidence = "Low";
  }

  if (
    bullishSignals.length > 0 &&
    bearishSignals.length > 0
  ) {
    signals.push(
      "Directional specialists contain conflicting bullish and bearish evidence."
    );
  }

  if (
    dataAnalysisAgent?.behaviour ===
    "Abnormal"
  ) {
    signals.push(
      "Data Analysis detected abnormal market behaviour."
    );

    if (confidence === "High") {
      confidence = "Medium";
    } else if (confidence === "Medium") {
      confidence = "Low";
    }
  }

  if (
    regimeAgent?.regime ===
    "Volatile"
  ) {
    signals.push(
      "Volatile market regime reduces confidence in directional agreement."
    );

    if (confidence === "High") {
      confidence = "Medium";
    } else if (confidence === "Medium") {
      confidence = "Low";
    }
  }

  if (bullishSignals.length > 0) {
    signals.push(
      `Bullish confirmation: ${bullishSignals.join(", ")}.`
    );
  }

  if (bearishSignals.length > 0) {
    signals.push(
      `Bearish confirmation: ${bearishSignals.join(", ")}.`
    );
  }

  return {
    agreement,
    direction,
    confidence,
    bullishCount:
      bullishSignals.length,
    bearishCount:
      bearishSignals.length,
    neutralCount:
      neutralSignals.length,
    bullishSignals,
    bearishSignals,
    neutralSignals,
    signals,
  };
}
