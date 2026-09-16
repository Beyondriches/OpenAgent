export function evaluateRiskReward(
  rr1,
  rr2,
  minimumRR
) {
  let adjustment = 0;
  let quality = "Acceptable";
  let explanation =
    "Risk/reward is adequate for the selected timeframe.";

  if (rr2 < minimumRR) {
    adjustment = -20;
    quality = "Poor";
    explanation =
      "Neither target provides sufficient reward relative to the defined downside risk.";
  } else if (rr1 < minimumRR) {
    adjustment = -10;
    quality = "Mixed";
    explanation =
      `Target 1 is below Theo's ${minimumRR.toFixed(2)}:1 minimum, although Target 2 meets the requirement.`;
  } else if (
    rr1 >= minimumRR &&
    rr2 >= 2
  ) {
    adjustment = 8;
    quality = "Strong";
    explanation =
      "Both targets meet Theo's risk/reward requirements, with strong extended-target potential.";
  } else {
    adjustment = 4;
    quality = "Good";
    explanation =
      "Both targets meet Theo's minimum risk/reward requirement.";
  }

  return {
    adjustment,
    quality,
    explanation,
  };
}
