export function evaluateSearchContext({
  newsItems = [],
}) {
  if (
    !Array.isArray(newsItems) ||
    newsItems.length === 0
  ) {
    return {
      sentiment: "Unknown",
      score: 0,
      majorDevelopments: 0,
      riskAlerts: [],
      confidence: "Low",
      signals: [
        "No external search data available.",
      ],
    };
  }

  let score = 0;
  let majorDevelopments = 0;

  const riskAlerts = [];
  const signals = [];

  const positiveWords = [
    "approval",
    "approved",
    "adoption",
    "partnership",
    "upgrade",
    "growth",
    "launch",
    "integration",
    "record",
    "inflow",
  ];

  const negativeWords = [
    "hack",
    "exploit",
    "breach",
    "lawsuit",
    "investigation",
    "ban",
    "outage",
    "liquidation",
    "fraud",
    "attack",
  ];

  for (const item of newsItems) {
    const text = `${item.title || ""} ${
      item.description || ""
    }`.toLowerCase();

    let itemScore = 0;

    for (const word of positiveWords) {
      if (text.includes(word)) {
        itemScore += 1;
      }
    }

    for (const word of negativeWords) {
      if (text.includes(word)) {
        itemScore -= 1;
      }
    }

    if (Math.abs(itemScore) >= 2) {
      majorDevelopments += 1;
    }

    if (itemScore < 0) {
      riskAlerts.push(
        item.title || "Negative development detected."
      );
    }

    score += itemScore;
  }

  let sentiment = "Neutral";

  if (score >= 2) {
    sentiment = "Positive";
  } else if (score <= -2) {
    sentiment = "Negative";
  }

  const confidence =
    newsItems.length >= 5
      ? "High"
      : newsItems.length >= 2
        ? "Medium"
        : "Low";

  signals.push(
    `Analyzed ${newsItems.length} external information items.`
  );

  return {
    sentiment,
    score,
    majorDevelopments,
    riskAlerts,
    confidence,
    signals,
  };
}
