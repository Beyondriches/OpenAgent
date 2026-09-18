const FIVE_MINUTES_MS = 5 * 60 * 1000;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function numeric(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function previousAnalysis(snapshot) {
  return snapshot?.analysis?.analysis ?? null;
}

export function calculateOrchestratorAdjustment(orchestratorAgent) {
  const direction = orchestratorAgent?.direction;
  if (direction !== "Bullish" && direction !== "Bearish") return 0;

  const score = clamp(numeric(orchestratorAgent?.confidenceScore) ?? 0, 0, 100);
  const confidence = orchestratorAgent?.confidence;
  const confidenceCap =
    confidence === "High" ? 10 :
    confidence === "Medium" ? 6 : 3;

  const magnitude = Math.min(confidenceCap, Math.round(score / 10));
  return direction === "Bullish" ? magnitude : -magnitude;
}

export function selectEligibleSnapshot({
  snapshots,
  symbol,
  timeframe,
  nowMs = Date.now(),
  minAgeMs = HISTORY_MIN_AGE_MS[timeframe],
}) {
  if (!Array.isArray(snapshots)) return null;

  return snapshots
    .filter((snapshot) => {
      if (!snapshot || snapshot.symbol !== symbol || snapshot.timeframe !== timeframe) {
        return false;
      }

      const createdAt = Date.parse(snapshot.created_at);
      if (!Number.isFinite(createdAt)) return false;

      const age = nowMs - createdAt;
      return age >= minAgeMs;
    })
    .slice()
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0] ?? null;
}

export function evaluateHistory({
  currentPrice,
  currentTechnicalScore,
  currentOrchestratorAgent,
  previousSnapshot,
}) {
  if (!previousSnapshot) {
    return {
      status: "Warming Up",
      eligible: false,
      adjustment: 0,
      deteriorating: false,
      previousSnapshotAt: null,
      priceChangePct: null,
      technicalScoreChange: null,
      orchestratorDirectionChange: null,
      reason: "No snapshot old enough for this timeframe's historical comparison is available yet.",
      previous: null,
    };
  }

  const oldAnalysis = previousAnalysis(previousSnapshot);
  const oldPrice =
    numeric(previousSnapshot?.current_price) ??
    numeric(previousSnapshot?.analysis?.market?.priceUSD);
  const newPrice = numeric(currentPrice);
  const oldTechnicalScore = numeric(oldAnalysis?.technicalScore);
  const newTechnicalScore = numeric(currentTechnicalScore);
  const oldDirection = oldAnalysis?.orchestratorAgent?.direction ?? "Unknown";
  const newDirection = currentOrchestratorAgent?.direction ?? "Unknown";

  const priceChangePct =
    oldPrice !== null && oldPrice > 0 && newPrice !== null
      ? ((newPrice - oldPrice) / oldPrice) * 100
      : null;

  const technicalScoreChange =
    oldTechnicalScore !== null && newTechnicalScore !== null
      ? newTechnicalScore - oldTechnicalScore
      : null;

  let adjustment = 0;
  const signals = [];

  if (technicalScoreChange !== null) {
    if (technicalScoreChange <= -10) {
      adjustment -= 4;
      signals.push("Technical score deteriorated materially.");
    } else if (technicalScoreChange <= -5) {
      adjustment -= 2;
      signals.push("Technical score weakened.");
    } else if (technicalScoreChange >= 10) {
      adjustment += 2;
      signals.push("Technical score improved materially.");
    } else if (technicalScoreChange >= 5) {
      adjustment += 1;
      signals.push("Technical score improved.");
    }
  }

  if (priceChangePct !== null) {
    if (priceChangePct <= -3) {
      adjustment -= 2;
      signals.push("Price declined materially since the eligible snapshot.");
    } else if (priceChangePct <= -1) {
      adjustment -= 1;
      signals.push("Price weakened since the eligible snapshot.");
    } else if (
      priceChangePct >= 1 &&
      technicalScoreChange !== null &&
      technicalScoreChange >= 5
    ) {
      adjustment += 1;
      signals.push("Price and technical score improved together.");
    }
  }

  if (oldDirection === "Bullish" && newDirection === "Bearish") {
    adjustment -= 2;
    signals.push("Orchestrator direction reversed from bullish to bearish.");
  } else if (oldDirection === "Bullish" && newDirection === "Neutral") {
    adjustment -= 1;
    signals.push("Orchestrator lost its previous bullish direction.");
  } else if (oldDirection === "Bearish" && newDirection === "Bullish") {
    adjustment += 1;
    signals.push("Orchestrator direction improved from bearish to bullish.");
  }

  adjustment = clamp(adjustment, -6, 4);

  const deteriorating =
    adjustment <= -4 ||
    (technicalScoreChange !== null && technicalScoreChange <= -5 &&
      priceChangePct !== null && priceChangePct <= -1) ||
    (oldDirection === "Bullish" && newDirection === "Bearish");

  return {
    status: "Eligible",
    eligible: true,
    adjustment,
    deteriorating,
    previousSnapshotAt: previousSnapshot.created_at ?? null,
    priceChangePct,
    technicalScoreChange,
    orchestratorDirectionChange: `${oldDirection} → ${newDirection}`,
    reason: signals.length
      ? signals.join(" ")
      : "Eligible history is stable and does not materially change the decision.",
    previous: {
      price: oldPrice,
      technicalScore: oldTechnicalScore,
      finalScore: numeric(oldAnalysis?.finalScore),
      outlook: oldAnalysis?.outlook ?? null,
      action: oldAnalysis?.action ?? null,
      orchestratorDirection: oldDirection,
    },
  };
}

export function applyHistoryGate(actionDecision, history) {
  if (!history?.deteriorating) {
    return {
      ...actionDecision,
      historyGateApplied: false,
    };
  }

  if (actionDecision?.action === "BUY NOW") {
    return {
      action: "WAIT",
      reason:
        "The current setup still qualifies on its own, but eligible history shows meaningful deterioration, so Theo pauses the new trade until conditions stabilize.",
      historyGateApplied: true,
    };
  }

  if (actionDecision?.action === "ACCUMULATE") {
    return {
      action: "HOLD / WAIT",
      reason:
        "The long-term setup remains constructive, but eligible history is deteriorating, so Theo pauses fresh accumulation until conditions stabilize.",
      historyGateApplied: true,
    };
  }

  return {
    ...actionDecision,
    historyGateApplied: false,
  };
}


export function calculateFinalActionScore({
  technicalScore,
  riskRewardAdjustment = 0,
  entryQualityAdjustment = 0,
  orchestratorAdjustment = 0,
  historyAdjustment = 0,
}) {
  const total =
    (numeric(technicalScore) ?? 0) +
    (numeric(riskRewardAdjustment) ?? 0) +
    (numeric(entryQualityAdjustment) ?? 0) +
    (numeric(orchestratorAdjustment) ?? 0) +
    (numeric(historyAdjustment) ?? 0);

  return Math.round(clamp(total, 0, 100));
}

export function buildDecisionBreakdown({
  technicalScore,
  riskRewardAdjustment,
  entryQualityAdjustment,
  orchestratorAdjustment,
  historyAdjustment,
  finalScore,
  history,
  historyGateApplied,
}) {
  return {
    technicalScore,
    riskRewardAdjustment,
    entryQualityAdjustment,
    orchestratorAdjustment,
    historyAdjustment,
    finalScore,
    historyStatus: history?.status ?? "Warming Up",
    historyGateApplied: Boolean(historyGateApplied),
  };
}

 export const HISTORY_MIN_AGE_MS = {
   day: 60 * 60 * 1000,
   swing: 24 * 60 * 60 * 1000,
   "long-term": 7 * 24 * 60 * 60 * 1000,
  };
