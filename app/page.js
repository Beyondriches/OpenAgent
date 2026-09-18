"use client";

import { useState } from "react";

const MODES = [
  { value: "long-term", label: "Long Term" },
  { value: "swing", label: "Swing Trading" },
  { value: "day", label: "Day Trading" },
];

const COINS = [
  "ETH",
  "BTC",
  "SOL",
  "XRP",
  "ADA",
  "DOGE",
  "AVAX",
  "LINK",
];

function money(value) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 10 ? 4 : 2,
  }).format(value);
}

function number(value, decimals = 2) {
  if (value === null || value === undefined) return "—";
  return Number(value).toFixed(decimals);
}

function signed(value) {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value}`;
}

function outlookColor(outlook) {
  if (outlook === "STRONGLY BULLISH") return "#22c55e";
  if (outlook === "BULLISH") return "#4ade80";
  if (outlook === "NEUTRAL") return "#eab308";
  if (outlook === "BEARISH") return "#fb7185";
  if (outlook === "STRONGLY BEARISH") return "#ef4444";
  return "#e5e7eb";
}

function actionColor(action) {
  if (action === "BUY NOW") return "#22c55e";
  if (action === "ACCUMULATE") return "#4ade80";
  if (action === "WAIT FOR PULLBACK") return "#f59e0b";
  if (action === "WAIT") return "#facc15";
  if (action === "HOLD / WAIT") return "#facc15";
  if (action === "AVOID") return "#ef4444";
  return "#e5e7eb";
}

function entryColor(quality) {
  if (quality === "Discounted") return "#22c55e";
  if (quality === "Attractive") return "#4ade80";
  if (quality === "Fair") return "#7dd3fc";
  if (quality === "Stretched") return "#f59e0b";
  if (quality === "Chasing") return "#ef4444";
  return "#e5e7eb";
}

function rrColor(quality) {
  if (quality === "Strong") return "#22c55e";
  if (quality === "Good") return "#4ade80";
  if (quality === "Acceptable") return "#60a5fa";
  if (quality === "Mixed") return "#facc15";
  if (quality === "Weak") return "#fb923c";
  if (quality === "Poor") return "#ef4444";
  return "#e5e7eb";
}

function capitalColor(enabled) {
  return enabled ? "#22c55e" : "#f59e0b";
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top, #172554 0%, #09090b 38%, #020617 100%)",
    color: "#f8fafc",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    padding: "40px 18px 80px",
  },

  container: {
    maxWidth: "980px",
    margin: "0 auto",
  },

  header: {
    marginBottom: "28px",
  },

  badge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(59,130,246,0.15)",
    border: "1px solid rgba(96,165,250,0.35)",
    color: "#93c5fd",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "14px",
  },

  riskBadge: {
    display: "inline-block",
    marginLeft: "8px",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.35)",
    color: "#fbbf24",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    marginBottom: "14px",
  },

  title: {
    fontSize: "clamp(34px, 7vw, 58px)",
    lineHeight: 1,
    margin: "0 0 12px",
    letterSpacing: "-0.04em",
  },

  subtitle: {
    margin: 0,
    color: "#94a3b8",
    maxWidth: "780px",
    fontSize: "16px",
    lineHeight: 1.6,
  },

  controls: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "18px",
  },

  control: {
    background: "rgba(15,23,42,0.82)",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "14px",
  },

  label: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "8px",
  },

  select: {
    width: "100%",
    background: "#020617",
    color: "#f8fafc",
    border: "1px solid #475569",
    borderRadius: "10px",
    padding: "11px 12px",
    fontSize: "15px",
  },

  button: {
    width: "100%",
    border: "none",
    borderRadius: "14px",
    padding: "15px 18px",
    background: "#2563eb",
    color: "white",
    fontWeight: 900,
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "24px",
  },

  error: {
    padding: "14px 16px",
    borderRadius: "14px",
    background: "rgba(127,29,29,0.3)",
    border: "1px solid rgba(248,113,113,0.4)",
    color: "#fecaca",
    marginBottom: "20px",
  },

  card: {
    background: "rgba(15,23,42,0.78)",
    border: "1px solid rgba(71,85,105,0.65)",
    borderRadius: "20px",
    padding: "22px",
    marginBottom: "16px",
    backdropFilter: "blur(12px)",
  },

  capitalCard: {
    background:
      "linear-gradient(135deg, rgba(30,41,59,0.92), rgba(15,23,42,0.82))",
    border: "1px solid rgba(245,158,11,0.38)",
    borderRadius: "20px",
    padding: "22px",
    marginBottom: "16px",
  },

  sectionTitle: {
    margin: "0 0 16px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: "0.12em",
  },

  decisionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "14px",
  },

  decisionBox: {
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "18px",
  },

  decisionLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    marginBottom: "9px",
  },

  decisionValue: {
    fontSize: "25px",
    fontWeight: 950,
    lineHeight: 1.1,
    marginBottom: "10px",
  },

  reason: {
    color: "#cbd5e1",
    lineHeight: 1.55,
    fontSize: "14px",
  },

  metrics: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "10px",
  },

  metric: {
    background: "rgba(2,6,23,0.65)",
    border: "1px solid #334155",
    borderRadius: "13px",
    padding: "14px",
  },

  metricLabel: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 800,
    marginBottom: "7px",
  },

  metricValue: {
    fontSize: "17px",
    fontWeight: 850,
  },

  paragraph: {
    color: "#cbd5e1",
    lineHeight: 1.65,
    margin: "14px 0 0",
  },

  framework: {
    color: "#cbd5e1",
    lineHeight: 1.7,
    paddingLeft: "20px",
    marginBottom: 0,
  },
};

export default function Home() {
  const [symbol, setSymbol] = useState("ETH");
  const [timeframe, setTimeframe] =
    useState("swing");

  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  function changeSymbol(value) {
    setSymbol(value);

    // v1.5:
    // Never display analysis belonging
    // to a previously selected asset.
    setData(null);
    setError("");
  }

  function changeTimeframe(value) {
    setTimeframe(value);

    // v1.5:
    // Never display analysis belonging
    // to a previously selected timeframe.
    setData(null);
    setError("");
  }

  async function analyze() {
    try {
      setLoading(true);
      setError("");
      setData(null);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            symbol,
            timeframe,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result?.error ||
            "Unable to analyze market."
        );
      }

      /*
        Extra v1.5 safety check.

        Even if an old/cached response somehow
        arrives, Theo will not display it unless
        it belongs to the selected asset and mode.
      */

      if (
        result.symbol !== symbol ||
        result.timeframe !== timeframe
      ) {
        throw new Error(
          "Analysis context changed. Please analyze again."
        );
      }

      setData(result);
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong."
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const analysis = data?.analysis;
  const market = data?.market;
  const technicals = data?.technicals;
  const capitalPlan =
    analysis?.capitalPlan;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <span style={styles.badge}>
              OPENAGENT v1.6
            </span>

            <span style={styles.riskBadge}>
              AGGRESSIVE GROWTH
            </span>
          </div>

          <h1 style={styles.title}>
            Theo Crypto Agent
          </h1>

          <p style={styles.subtitle}>
            Adaptive crypto intelligence with
            separate market outlook, immediate
            action, entry-quality analysis and
            disciplined aggressive capital sizing.
          </p>
        </header>

        <section style={styles.controls}>
          <div style={styles.control}>
            <label style={styles.label}>
              ASSET
            </label>

            <select
              style={styles.select}
              value={symbol}
              onChange={(e) =>
                changeSymbol(
                  e.target.value
                )
              }
            >
              {COINS.map((coin) => (
                <option
                  key={coin}
                  value={coin}
                >
                  {coin}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.control}>
            <label style={styles.label}>
              ANALYSIS MODE
            </label>

            <select
              style={styles.select}
              value={timeframe}
              onChange={(e) =>
                changeTimeframe(
                  e.target.value
                )
              }
            >
              {MODES.map((mode) => (
                <option
                  key={mode.value}
                  value={mode.value}
                >
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <button
          style={{
            ...styles.button,
            opacity: loading
              ? 0.65
              : 1,
          }}
          onClick={analyze}
          disabled={loading}
        >
          {loading
            ? "THEO IS ANALYZING..."
            : "ANALYZE MARKET"}
        </button>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {data && analysis && (
          <>
            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                SNAPSHOT MEMORY
              </h2>

              <div style={styles.metrics}>
                <Metric
                  label="Asset / Mode"
                  value={`${data.symbol} / ${data.timeframe}`}
                />

                <Metric
                  label="History Count Reported"
                  value={data.previousSnapshotCount ?? "Not provided"}
                />

                <Metric
                  label="Snapshots Received"
                  value={
                    Array.isArray(data.previousSnapshots)
                      ? data.previousSnapshots.length
                      : "Not provided"
                  }
                />

                <Metric
                  label="History Engine"
                  value={
                    data?.history?.status ??
                    "Legacy"
                  }
                />

                <Metric
                  label="Eligible Snapshot"
                  value={
                    data?.history?.previousSnapshotAt
                      ? new Date(
                          data.history.previousSnapshotAt
                        ).toLocaleString()
                      : "Warming Up"
                  }
                />
              </div>

              <p style={styles.paragraph}>
                {data?.history?.status === "Eligible"
                  ? data.history.reason
                  : data?.history?.status === "Warming Up"
                    ? `History is warming up. Theo waits for a snapshot at least ${timeframe === "day" ? "one hour" : timeframe === "swing" ? "24 hours" : "7 days"} older before historical movement can influence the decision.`
                    : Array.isArray(data.previousSnapshots) &&
                        data.previousSnapshots.length > 0
                      ? "Previous snapshots received for this asset and timeframe."
                      : "No previous snapshots received in this response."}
              </p>
            </section>

            <SnapshotComparison data={data} />

            <section style={styles.card}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                THEO OUTLOOK + ACTION
                ENGINE
              </h2>

              <div
                style={
                  styles.decisionGrid
                }
              >
                <div
                  style={
                    styles.decisionBox
                  }
                >
                  <div
                    style={
                      styles.decisionLabel
                    }
                  >
                    MARKET OUTLOOK
                  </div>

                  <div
                    style={{
                      ...styles.decisionValue,

                      color:
                        outlookColor(
                          analysis.outlook
                        ),
                    }}
                  >
                    {analysis.outlook}
                  </div>

                  <div
                    style={
                      styles.reason
                    }
                  >
                    {
                      analysis.outlookReason
                    }
                  </div>
                </div>

                <div
                  style={
                    styles.decisionBox
                  }
                >
                  <div
                    style={
                      styles.decisionLabel
                    }
                  >
                    ACTION NOW
                  </div>

                  <div
                    style={{
                      ...styles.decisionValue,

                      color:
                        actionColor(
                          analysis.action
                        ),
                    }}
                  >
                    {analysis.action}
                  </div>

                  <div
                    style={
                      styles.reason
                    }
                  >
                    {
                      analysis.actionReason
                    }
                  </div>
                </div>
              </div>
            </section>

            {capitalPlan && (
              <section
                style={
                  styles.capitalCard
                }
              >
                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  CAPITAL PROTECTION +
                  POSITION SIZING
                </h2>

                {data.timeframe ===
                "long-term" ? (
                  <>
                    <div
                      style={
                        styles.metrics
                      }
                    >
                      <Metric
                        label="Risk Profile"
                        value={
                          data
                            .riskProfile
                            ?.name
                        }
                        color="#fbbf24"
                      />

                      <Metric
                        label="New Allocation"
                        value={`${number(
                          capitalPlan.allocationPct,
                          0
                        )}%`}
                        color={capitalColor(
                          capitalPlan.enabled
                        )}
                      />

                      <Metric
                        label="Allocation Strength"
                        value={
                          capitalPlan.allocationStrength
                        }
                      />

                      <Metric
                        label="Leverage"
                        value="OFF"
                      />
                    </div>

                    <p
                      style={
                        styles.paragraph
                      }
                    >
                      {
                        capitalPlan.explanation
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      style={
                        styles.metrics
                      }
                    >
                      <Metric
                        label="Risk Profile"
                        value={
                          data
                            .riskProfile
                            ?.name
                        }
                        color="#fbbf24"
                      />

                      <Metric
                        label="Setup Strength"
                        value={
                          capitalPlan.setupStrength
                        }
                      />

                      <Metric
                        label="Planned Account Risk"
                        value={`${number(
                          capitalPlan.riskPct
                        )}%`}
                        color={capitalColor(
                          capitalPlan.enabled
                        )}
                      />

                      <Metric
                        label="Position Ceiling"
                        value={`${number(
                          capitalPlan.positionPct
                        )}%`}
                        color={capitalColor(
                          capitalPlan.enabled
                        )}
                      />

                      <Metric
                        label="Invalidation Distance"
                        value={`${number(
                          capitalPlan.stopDistancePct
                        )}%`}
                      />

                      <Metric
                        label="Leverage"
                        value="OFF"
                      />
                    </div>

                    <p
                      style={
                        styles.paragraph
                      }
                    >
                      {
                        capitalPlan.explanation
                      }
                    </p>
                  </>
                )}
              </section>
            )}

            <section style={styles.card}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                DECISION QUALITY
              </h2>

              <div
                style={styles.metrics}
              >
                <Metric
                  label="Technical Score"
                  value={`${analysis.technicalScore}/100`}
                />

                <Metric
                  label="Action Score"
                  value={`${analysis.finalScore}/100`}
                />

                <Metric
                  label="Confidence"
                  value={
                    analysis.confidence
                  }
                />

                <Metric
                  label="Trend"
                  value={analysis.trend}
                />

                <Metric
                  label="Timeframe Confirmation"
                  value={
                    analysis.timeframeConfirmation
                  }
                />

                <Metric
                  label="Momentum"
                  value={
                    analysis.momentum
                  }
                />
                
                <Metric
                  label="Momentum Agent"
                  value={
                    analysis.momentumAgent
                      ? `${analysis.momentumAgent.momentum} (${analysis.momentumAgent.score})`
                      : "N/A"
                  }
                />

                <Metric
                  label="Trend Agent"
                  value={
                    analysis.trendAgent
                      ? `${analysis.trendAgent.trend} (${analysis.trendAgent.score})`
                      : "N/A"
                  }
                />
               
                <Metric
                  label="Volatility Agent"
                  value={
                    analysis.volatilityAgent
                      ? `${analysis.volatilityAgent.volatility} (${analysis.volatilityAgent.score})`
                      : "N/A"
                  }
                />

                <Metric
                  label="Volume Agent"
                  value={
                    analysis.volumeAgent
                      ? `${analysis.volumeAgent.volume} (${analysis.volumeAgent.score})`
                      : "N/A"
                  }
                />

                <Metric
                  label="Liquidity Agent"
                  value={
                    analysis.liquidityAgent
                      ? `${analysis.liquidityAgent.liquidity} (${analysis.liquidityAgent.score})`
                      : "N/A"
                  }
                />

                <Metric
                  label="Structure Agent"
                  value={
                    analysis.structureAgent
                    ? `${analysis.structureAgent.structure} (${analysis.structureAgent.score})`
                    : "N/A"
                }
              />

                <Metric
                  label="Search Agent"
                  value={
                    analysis.searchAgent
                    ? `${analysis.searchAgent.sentiment} (${analysis.searchAgent.score}) • ${analysis.searchAgent.confidence} confidence • ${analysis.searchAgent.articleCount ?? 0} articles`
                    : "N/A"
                 }
               />

                <Metric
                  label="Data Analysis Agent"
                  value={
                    analysis.dataAnalysisAgent
                    ? `${analysis.dataAnalysisAgent.behaviour} • ${analysis.dataAnalysisAgent.trendConsistency} consistency • ${analysis.dataAnalysisAgent.confidence} confidence`
                    : "N/A"
                 }
               />

                 <Metric
                  label="Regime Agent"
                  value={
                    analysis.regimeAgent
                    ? `${analysis.regimeAgent.regime} (${analysis.regimeAgent.score})`
                    : "N/A"
                 }
               />

                 <Metric
                   label="Compare Agent"
                   value={
                     analysis.compareAgent
                     ? `${analysis.compareAgent.agreement} agreement • ${analysis.compareAgent.direction} • ${analysis.compareAgent.confidence} confidence`
                     : "N/A"
                  }
                />

                  <Metric
                    label="Orchestrator Agent"
                    value={
                      analysis.orchestratorAgent
                      ? `${analysis.orchestratorAgent.direction} • ${analysis.orchestratorAgent.confidence} confidence (${analysis.orchestratorAgent.confidenceScore}/100)`
                      : "N/A"
                   }
                 />

                   <Metric
                     label="Risk"
                     value={analysis.risk}
                   />
                   </div>
                   </section>

                   {analysis.decisionBreakdown && (
                     <section style={styles.card}>
                       <h2 style={styles.sectionTitle}>
                         DECISION BREAKDOWN
                       </h2>

                       <div style={styles.metrics}>
                         <Metric
                           label="Technical Base"
                           value={`${analysis.decisionBreakdown.technicalScore}/100`}
                         />

                         <Metric
                           label="Risk / Reward Adjustment"
                           value={`${signed(analysis.decisionBreakdown.riskRewardAdjustment)} pts`}
                         />

                         <Metric
                           label="Entry Adjustment"
                           value={`${signed(analysis.decisionBreakdown.entryQualityAdjustment)} pts`}
                         />

                         <Metric
                           label="Orchestrator Adjustment"
                           value={`${signed(analysis.decisionBreakdown.orchestratorAdjustment)} pts`}
                         />

                         <Metric
                           label="History Adjustment"
                           value={`${signed(analysis.decisionBreakdown.historyAdjustment)} pts`}
                         />

                         <Metric
                           label="Final Action Score"
                           value={`${analysis.decisionBreakdown.finalScore}/100`}
                         />

                         <Metric
                           label="History Status"
                           value={analysis.decisionBreakdown.historyStatus}
                         />

                         <Metric
                           label="History Gate"
                           value={
                             analysis.decisionBreakdown.historyGateApplied
                               ? "APPLIED"
                               : "Not Applied"
                           }
                         />
                       </div>

                       <p style={styles.paragraph}>
                         {data?.history?.reason ??
                           "No historical decision context is available yet."}
                       </p>
                     </section>
                   )}

                   <section style={styles.card}>
                     <h2
                       style={
                         styles.sectionTitle
                  }
                >
               
                ENTRY QUALITY
              </h2>

              <div
                style={styles.metrics}
              >
                <Metric
                  label="Quality"
                  value={
                    analysis
                      .entryQuality
                      .quality
                  }
                  color={entryColor(
                    analysis
                      .entryQuality
                      .quality
                  )}
                />

                <Metric
                  label="Entry Adjustment"
                  value={`${signed(
                    analysis
                      .entryQuality
                      .scoreAdjustment
                  )} pts`}
                />

                <Metric
                  label="Price vs Fast SMA"
                  value={`${signed(
                    analysis
                      .entryQuality
                      .distanceFromFastSMA
                  )}%`}
                />

                <Metric
                  label="Recent Range Position"
                  value={`${analysis.entryQuality.recentRangePosition}%`}
                />

                <Metric
                  label="Entry-Zone Proximity"
                  value={`${analysis.entryProgress}%`}
                />
              </div>

              <p
                style={styles.paragraph}
              >
                {
                  analysis
                    .entryQuality
                    .explanation
                }
              </p>
            </section>

            <section style={styles.card}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                RISK / REWARD GATE
              </h2>

              <div
                style={styles.metrics}
              >
                <Metric
                  label="Quality"
                  value={
                    analysis
                      .riskReward
                      .quality
                  }
                  color={rrColor(
                    analysis
                      .riskReward
                      .quality
                  )}
                />

                <Metric
                  label="R:R Target 1"
                  value={`${number(
                    analysis
                      .riskReward
                      .target1
                  )}:1`}
                />

                <Metric
                  label="R:R Target 2"
                  value={`${number(
                    analysis
                      .riskReward
                      .target2
                  )}:1`}
                />

                <Metric
                  label="Minimum"
                  value={`${number(
                    analysis
                      .riskReward
                      .minimum
                  )}:1`}
                />

                <Metric
                  label="Score Adjustment"
                  value={`${signed(
                    analysis
                      .riskReward
                      .scoreAdjustment
                  )} pts`}
                />
              </div>

              <p
                style={styles.paragraph}
              >
                {
                  analysis
                    .riskReward
                    .explanation
                }
              </p>
            </section>

            <section style={styles.card}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                TRADE STRUCTURE
              </h2>

              <div
                style={styles.metrics}
              >
                <Metric
                  label="Current Price"
                  value={money(
                    market.priceUSD
                  )}
                />

                <Metric
                  label="Entry Low"
                  value={money(
                    analysis
                      .entryZone.low
                  )}
                />

                <Metric
                  label="Entry High"
                  value={money(
                    analysis
                      .entryZone.high
                  )}
                />

                <Metric
                  label="Invalidation"
                  value={money(
                    analysis.invalidation
                  )}
                />

                <Metric
                  label="Target 1"
                  value={money(
                    analysis.targets[0]
                  )}
                />

                <Metric
                  label="Target 2"
                  value={money(
                    analysis.targets[1]
                  )}
                />
              </div>
            </section>

            <section style={styles.card}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                MARKET STRUCTURE
              </h2>

              <div
                style={styles.metrics}
              >
                <Metric
                  label="RSI"
                  value={number(
                    technicals.rsi,
                    1
                  )}
                />

                <Metric
                  label="Fast SMA"
                  value={money(
                    technicals.fastSMA
                  )}
                />

                <Metric
                  label="Slow SMA"
                  value={money(
                    technicals.slowSMA
                  )}
                />

                <Metric
                  label="14D Volatility"
                  value={`${number(
                    technicals.volatility14d
                  )}%`}
                />

                <Metric
                  label="Recent High"
                  value={money(
                    technicals.recentHigh
                  )}
                />

                <Metric
                  label="Recent Low"
                  value={money(
                    technicals.recentLow
                  )}
                />

                <Metric
                  label="7D Change"
                  value={`${signed(
                    technicals.change7d
                  )}%`}
                />

                <Metric
                  label="30D Change"
                  value={`${signed(
                    technicals.change30d
                  )}%`}
                />
              </div>
            </section>

            <section style={styles.card}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                THEO SUMMARY
              </h2>

              <p
                style={styles.paragraph}
              >
                {data.summary}
              </p>
            </section>

            <section style={styles.card}>
              <h2
                style={
                  styles.sectionTitle
                }
              >
                THEO FRAMEWORK
              </h2>

              <ul
                style={styles.framework}
              >
                {data.framework.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  color,
}) {
  return (
    <div style={styles.metric}>
      <div
        style={styles.metricLabel}
      >
        {label}
      </div>

      <div
        style={{
          ...styles.metricValue,
          color:
            color || "#f8fafc",
        }}
      >
        {value}
      </div>
    </div>
  );
}

// A saved row contains the full API result in row.analysis.
function historyNumber(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function historyDelta(current, previous, percentage = false) {
  const now = historyNumber(current);
  const before = historyNumber(previous);
  if (now === null || before === null || (percentage && before <= 0)) return "—";
  const delta = percentage ? ((now - before) / before) * 100 : now - before;
  if (!Number.isFinite(delta)) return "—";
  const rounded = Number(delta.toFixed(2));
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(2)}${percentage ? "%" : " pts"}`;
}

function historyText(value) {
  return typeof value === "string" && value.trim() ? value : "—";
}

function SnapshotComparison({ data }) {
  const history = data?.history;
  const previous = history?.previous;
  const current = data?.analysis;
  const previousPrice = historyNumber(previous?.price);
  const currentPrice = historyNumber(data?.market?.priceUSD);

  const score = (value) => {
    const parsed = historyNumber(value);
    return parsed === null ? "—" : `${parsed}/100`;
  };

  const textChange = (before, now) =>
    historyText(before) === "—" || historyText(now) === "—"
      ? "—"
      : before === now ? "Unchanged" : "Changed";

  const rows = [
    [
      "Price",
      money(previousPrice),
      money(currentPrice),
      history?.priceChangePct == null
        ? "—"
        : `${signed(number(history.priceChangePct))}%`,
    ],
    [
      "Technical score",
      score(previous?.technicalScore),
      score(current?.technicalScore),
      history?.technicalScoreChange == null
        ? "—"
        : `${signed(number(history.technicalScoreChange))} pts`,
    ],
    [
      "Action score",
      score(previous?.finalScore),
      score(current?.finalScore),
      historyDelta(current?.finalScore, previous?.finalScore),
    ],
    [
      "Outlook",
      historyText(previous?.outlook),
      historyText(current?.outlook),
      textChange(previous?.outlook, current?.outlook),
    ],
    [
      "Action",
      historyText(previous?.action),
      historyText(current?.action),
      textChange(previous?.action, current?.action),
    ],
  ];

  const cellStyle = {
    padding: "12px 14px",
    borderBottom: "1px solid #334155",
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  return (
    <section style={styles.card}>
      <h2 style={styles.sectionTitle}>
        CHANGES SINCE ELIGIBLE ANALYSIS
      </h2>

      {history?.status === "Eligible" && previous ? (
        <>
          <p style={{ ...styles.reason, margin: "0 0 14px" }}>
            {data.symbol} / {MODES.find((mode) => mode.value === data.timeframe)?.label ?? data.timeframe}
            {" · Eligible snapshot: "}
            <time dateTime={history.previousSnapshotAt}>
              {new Date(history.previousSnapshotAt).toLocaleString(undefined, { timeZoneName: "short" })}
            </time>
          </p>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <caption style={{ textAlign: "left", color: "#94a3b8", paddingBottom: "10px" }}>
                Current analysis compared with the newest saved snapshot that is at least {timeframe === "day" ? "one hour" : timeframe === "swing" ? "24 hours" : "7 days"} older.
              </caption>
              <thead>
                <tr>
                  {["Metric", "Previous", "Current", "Change"].map((heading) => (
                    <th key={heading} scope="col" style={{ ...cellStyle, color: "#94a3b8" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([label, before, now, change]) => (
                  <tr key={label}>
                    <th scope="row" style={cellStyle}>{label}</th>
                    <td style={{ ...cellStyle, color: "#cbd5e1" }}>{before}</td>
                    <td style={cellStyle}>{now}</td>
                    <td style={cellStyle}>{change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={styles.paragraph}>
            Historical scoring only uses eligible snapshots. Rapid repeat clicks remain visible in memory, but they do not manufacture a new history signal.
          </p>
        </>
      ) : (
        <p style={styles.paragraph}>
          <strong>Warming Up.</strong>{" "}
          No snapshot at least {timeframe === "day" ? "one hour" : timeframe === "swing" ? "24 hours" : "7 days"} older is available for this asset and mode yet. Current analysis still works, but history contributes 0 points until an eligible comparison exists.
        </p>
      )}
    </section>
  );
}

