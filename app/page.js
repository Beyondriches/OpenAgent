"use client";

import { useState } from "react";

export default function Home() {
  const [symbol, setSymbol] = useState("ETH");
  const [timeframe, setTimeframe] = useState("swing");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          timeframe,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const money = (value) => {
    if (value === undefined || value === null) return "—";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value < 10 ? 4 : 2,
    }).format(value);
  };

  const compactMoney = (value) => {
    if (value === undefined || value === null) return "—";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const number = (value, digits = 2) => {
    if (value === undefined || value === null) return "—";
    return Number(value).toFixed(digits);
  };

  const percent = (value) => {
    if (value === undefined || value === null) return "—";
    const n = Number(value);
    return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
  };

  const signalColor = (verdict) => {
    if (verdict === "BUY") return "#42e695";
    if (verdict === "AVOID") return "#ff5c70";
    return "#ffc857";
  };

  const valueColor = (value) => {
    const n = Number(value);
    if (n > 0) return "#42e695";
    if (n < 0) return "#ff6577";
    return "#f5f7fb";
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#080b12",
      color: "#f5f7fb",
      fontFamily: "Arial, sans-serif",
      padding: "48px 20px",
    },

    card: {
      maxWidth: 820,
      margin: "0 auto",
      background: "#111722",
      border: "1px solid #273044",
      borderRadius: 18,
      padding: 28,
      boxShadow: "0 18px 60px rgba(0,0,0,.35)",
    },

    badge: {
      display: "inline-block",
      padding: "6px 10px",
      border: "1px solid #36415a",
      borderRadius: 999,
      color: "#aebbd2",
      fontSize: 13,
    },

    subtitle: {
      color: "#aebbd2",
      lineHeight: 1.5,
    },

    label: {
      display: "block",
      marginTop: 18,
      marginBottom: 8,
      fontWeight: 700,
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: 13,
      borderRadius: 10,
      border: "1px solid #36415a",
      background: "#0b1019",
      color: "#fff",
      fontSize: 16,
    },

    button: {
      width: "100%",
   "use client";

import { useState } from "react";

export default function Home() {
  const [symbol, setSymbol] = useState("ETH");
  const [timeframe, setTimeframe] = useState("swing");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symbol, timeframe }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function money(value) {
    if (value === null || value === undefined) return "—";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value < 10 ? 4 : 2,
    }).format(value);
  }

  function compactMoney(value) {
    if (value === null || value === undefined) return "—";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }

  function number(value, digits = 2) {
    if (value === null || value === undefined) return "—";
    return Number(value).toFixed(digits);
  }

  function signalColor(signal) {
    if (signal === "STRONG BUY") return "#20e38a";
    if (signal === "BUY") return "#54e39b";
    if (signal === "WAIT") return "#ffc857";
    if (signal === "SELL") return "#ff8a65";
    if (signal === "STRONG SELL") return "#ff5263";
    return "#ffffff";
  }

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#080b12",
      color: "#f5f7fb",
      fontFamily: "Arial, sans-serif",
      padding: "48px 20px",
    },

    card: {
      maxWidth: 820,
      margin: "0 auto",
      background: "#111722",
      border: "1px solid #273044",
      borderRadius: 18,
      padding: 28,
      boxShadow: "0 18px 60px rgba(0,0,0,.35)",
    },

    badge: {
      display: "inline-block",
      padding: "6px 10px",
      border: "1px solid #36415a",
      borderRadius: 999,
      color: "#aebbd2",
      fontSize: 13,
    },

    subtitle: {
      color: "#aebbd2",
      lineHeight: 1.5,
    },

    label: {
      display: "block",
      marginTop: 18,
      marginBottom: 8,
      fontWeight: 700,
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: 13,
      borderRadius: 10,
      border: "1px solid #36415a",
      background: "#0b1019",
      color: "#fff",
      fontSize: 16,
    },

    button: {
      width: "100%",
      marginTop: 14,
      padding: 13,
      border: 0,
      borderRadius: 10,
      fontWeight: 800,
      cursor: "pointer",
      fontSize: 15,
    },

    result: {
      marginTop: 18,
      background: "#0b1019",
      border: "1px solid #273044",
      borderRadius: 14,
      padding: 18,
    },

    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },

    live: {
      color: "#42e695",
      fontWeight: 800,
      fontSize: 12,
    },

    price: {
      fontSize: 34,
      fontWeight: 900,
      marginTop: 22,
      marginBottom: 4,
    },

    section: {
      marginTop: 16,
      padding: 16,
      border: "1px solid #273044",
      borderRadius: 12,
      background: "#101725",
    },

    sectionTitle: {
      color: "#8fb3df",
      fontSize: 12,
      letterSpacing: 1.4,
      marginBottom: 14,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
      gap: 10,
      marginTop: 16,
    },

    metric: {
      background: "#111827",
      border: "1px solid #273044",
      borderRadius: 10,
      padding: 12,
      minHeight: 54,
    },

    metricLabel: {
      color: "#94a3b8",
      fontSize: 12,
      marginBottom: 6,
    },

    reason: {
      marginTop: 16,
      padding: 14,
      background: "#0b1019",
      border: "1px solid #273044",
      borderRadius: 10,
      lineHeight: 1.55,
    },

    progressTrack: {
      height: 12,
      marginTop: 10,
      background: "#20293a",
      borderRadius: 999,
      overflow: "hidden",
    },

    summary: {
      marginTop: 18,
      lineHeight: 1.55,
    },

    list: {
      lineHeight: 1.65,
      color: "#dbe4f0",
    },

    error: {
      marginTop: 18,
      background: "#3f1515",
      border: "1px solid #7f1d1d",
      borderRadius: 10,
      padding: 14,
      color: "#fecaca",
    },
  };

  const market = result?.market;
  const analysis = result?.analysis;
  const technicals = result?.technicals;

  const progress = Math.max(
    0,
    Math.min(100, Number(analysis?.entryProgress || 0))
  );

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <span style={styles.badge}>OpenAgent v1.0</span>

        <h1>Theo Crypto Agent</h1>

        <p style={styles.subtitle}>
          Multi-timeframe crypto decision intelligence for long-term,
          swing and day-trading research.
        </p>

        <label style={styles.label}>Asset symbol</label>

        <input
          style={styles.input}
          value={symbol}
          onChange={(e) =>
            setSymbol(e.target.value.toUpperCase())
          }
          placeholder="ETH"
        />

        <label style={styles.label}>Mode</label>

        <select
          style={styles.input}
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="swing">Swing</option>
          <option value="day">Day Trading</option>
          <option value="long-term">Long Term</option>
        </select>

        <button
          style={styles.button}
          onClick={analyze}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <div style={styles.error}>{error}</div>}

        {result && (
          <div style={styles.result}>
            <div style={styles.topRow}>
              <div>
                <h2 style={{ margin: 0 }}>{result.symbol}</h2>
                <div style={styles.subtitle}>
                  {market?.name}
                </div>
              </div>

              <div style={styles.live}>● LIVE</div>
            </div>

            <div style={styles.price}>
              {money(market?.priceUSD)}
            </div>

            <div
              style={{
                fontWeight: 800,
                color:
                  market?.change24h >= 0
                    ? "#42e695"
                    : "#ff6577",
              }}
            >
              {market?.change24h >= 0 ? "+" : ""}
              {number(market?.change24h)}% (24h)
            </div>

            <div style={styles.grid}>
              <Metric
                label="Market Cap"
                value={compactMoney(market?.marketCapUSD)}
                styles={styles}
              />

              <Metric
                label="24h Volume"
                value={compactMoney(market?.volume24hUSD)}
                styles={styles}
              />

              <Metric
                label="Market Rank"
                value={
                  market?.marketCapRank
                    ? `#${market.marketCapRank}`
                    : "—"
                }
                styles={styles}
              />

              <Metric
                label="Mode"
                value={result.timeframe}
                styles={styles}
              />
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                THEO DECISION ENGINE
              </div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: signalColor(analysis?.verdict),
                }}
              >
                {analysis?.verdict}
              </div>

              <div style={styles.grid}>
                <Metric
                  label="Theo Score"
                  value={`${analysis?.score}/100`}
                  styles={styles}
                />

                <Metric
                  label="Confidence"
                  value={analysis?.confidence}
                  styles={styles}
                />

                <Metric
                  label="Trend"
                  value={analysis?.trend}
                  styles={styles}
                />

                <Metric
                  label="Momentum"
                  value={analysis?.momentum}
                  styles={styles}
                />

                <Metric
                  label="Risk"
                  value={analysis?.risk}
                  styles={styles}
                />

                <Metric
                  label="Entry Proximity"
                  value={`${number(
                    analysis?.entryProgress,
                    0
                  )}%`}
                  styles={styles}
                />
              </div>

              <div style={styles.reason}>
                <strong>Why Theo chose this:</strong>
                <div style={{ marginTop: 6 }}>
                  {analysis?.reason}
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                TRADE STRUCTURE
              </div>

              <div style={styles.grid}>
                <Metric
                  label="Entry Low"
                  value={money(analysis?.entryZone?.low)}
                  styles={styles}
                />

                <Metric
                  label="Entry High"
                  value={money(analysis?.entryZone?.high)}
                  styles={styles}
                />

                <Metric
                  label="Invalidation"
                  value={money(analysis?.invalidation)}
                  styles={styles}
                />

                <Metric
                  label="Target 1"
                  value={money(analysis?.targets?.[0])}
                  styles={styles}
                />

                <Metric
                  label="Target 2"
                  value={money(analysis?.targets?.[1])}
                  styles={styles}
                />

                <Metric
                  label="R:R Target 1"
                  value={
                    analysis?.riskReward?.target1 !== undefined
                      ? `${number(
                          analysis.riskReward.target1
                        )}:1`
                      : "—"
                  }
                  styles={styles}
                />

                <Metric
                  label="R:R Target 2"
                  value={
                    analysis?.riskReward?.target2 !== undefined
                      ? `${number(
                          analysis.riskReward.target2
                        )}:1`
                      : "—"
                  }
                  styles={styles}
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#94a3b8",
                    fontSize: 12,
                  }}
                >
                  <span>Entry-zone proximity</span>
                  <span>{number(progress, 0)}%</span>
                </div>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progress}%`,
                      background: signalColor(
                        analysis?.verdict
                      ),
                      borderRadius: 999,
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                MARKET STRUCTURE
              </div>

              <div style={styles.grid}>
                <Metric
                  label="RSI"
                  value={number(technicals?.rsi, 1)}
                  styles={styles}
                />

                <Metric
                  label="Fast SMA"
                  value={money(technicals?.fastSMA)}
                  styles={styles}
                />

                <Metric
                  label="Slow SMA"
                  value={money(technicals?.slowSMA)}
                  styles={styles}
                />

                <Metric
                  label="14d Volatility"
                  value={`${number(
                    technicals?.volatility14d
                  )}%`}
                  styles={styles}
                />

                <Metric
                  label="Recent High"
                  value={money(technicals?.recentHigh)}
                  styles={styles}
                />

                <Metric
                  label="Recent Low"
                  value={money(technicals?.recentLow)}
                  styles={styles}
                />

                <Metric
                  label="7d Change"
                  value={`${technicals?.change7d >= 0 ? "+" : ""}${number(
                    technicals?.change7d
                  )}%`}
                  styles={styles}
                />

                <Metric
                  label="30d Change"
                  value={`${technicals?.change30d >= 0 ? "+" : ""}${number(
                    technicals?.change30d
                  )}%`}
                  styles={styles}
                />
              </div>
            </div>

            <p style={styles.summary}>
              {result.summary}
            </p>

            <ul style={styles.list}>
              {(result.framework || []).map(
                (item, index) => (
                  <li key={index}>{item}</li>
                )
              )}
            </ul>

            <div
              style={{
                marginTop: 18,
                paddingTop: 14,
                borderTop: "1px solid #273044",
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Data source: {result.source} • Theo Decision
              Engine v1.0
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, styles }) {
  return (
    <div style={styles.metric}>
      <div style={styles.metricLabel}>{label}</div>
      <strong>{value ?? "—"}</strong>
    </div>
  );
}