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

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#080b12",
      color: "#f5f7fb",
      fontFamily: "Arial, sans-serif",
      padding: "48px 20px",
    },

    card: {
      maxWidth: 760,
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
      fontSize: 14,
    },

    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: 12,
      borderRadius: 10,
      border: "1px solid #36415a",
      background: "#0b1019",
      color: "#fff",
      fontSize: 16,
    },

    button: {
      width: "100%",
      marginTop: 16,
      padding: 13,
      border: 0,
      borderRadius: 10,
      fontWeight: 800,
      fontSize: 15,
      cursor: "pointer",
    },

    result: {
      marginTop: 18,
      padding: 16,
      background: "#0b1019",
      border: "1px solid #273044",
      borderRadius: 14,
    },

    topRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 16,
      alignItems: "flex-start",
    },

    live: {
      color: "#50e38b",
      fontWeight: 800,
      fontSize: 12,
    },

    price: {
      fontSize: 34,
      fontWeight: 900,
      marginTop: 20,
      marginBottom: 4,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: 10,
      marginTop: 18,
    },

    metric: {
      background: "#111827",
      border: "1px solid #273044",
      borderRadius: 10,
      padding: 13,
    },

    metricLabel: {
      color: "#94a3b8",
      fontSize: 12,
      marginBottom: 6,
    },

    signal: {
      marginTop: 18,
      padding: 18,
      background: "#111827",
      border: "1px solid #36415a",
      borderRadius: 12,
    },

    signalTitle: {
      margin: 0,
      fontSize: 13,
      letterSpacing: 1.5,
      color: "#94a3b8",
    },

    verdict: {
      fontSize: 28,
      fontWeight: 900,
      marginTop: 8,
      marginBottom: 4,
    },

    summary: {
      marginTop: 18,
      lineHeight: 1.55,
    },

    list: {
      lineHeight: 1.6,
      color: "#dbe4f0",
    },

    source: {
      marginTop: 18,
      paddingTop: 14,
      borderTop: "1px solid #273044",
      color: "#64748b",
      fontSize: 12,
    },

    error: {
      marginTop: 18,
      padding: 14,
      background: "#3f1515",
      border: "1px solid #7f1d1d",
      borderRadius: 10,
      color: "#fecaca",
    },
  };

  const market = result?.market;
  const analysis = result?.analysis;

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <span style={styles.badge}>OpenAgent v0.5</span>

        <h1 style={{ fontSize: 34, marginBottom: 8 }}>
          Theo Crypto Agent
        </h1>

        <p style={styles.subtitle}>
          Live crypto market intelligence for long-term, swing and
          day-trading research.
        </p>

        <label style={styles.label}>Asset symbol</label>

        <input
          style={styles.input}
          value={symbol}
          onChange={(event) => setSymbol(event.target.value.toUpperCase())}
          placeholder="ETH"
        />

        <label style={styles.label}>Mode</label>

        <select
          style={styles.input}
          value={timeframe}
          onChange={(event) => setTimeframe(event.target.value)}
        >
          <option value="long-term">Long-term</option>
          <option value="swing">Swing</option>
          <option value="day">Day trading</option>
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
          <section style={styles.result}>
            <div style={styles.topRow}>
              <div>
                <h2 style={{ margin: 0 }}>{result.symbol}</h2>

                <div style={{ color: "#94a3b8", marginTop: 4 }}>
                  {market?.name || result.symbol}
                </div>
              </div>

              <div style={styles.live}>● LIVE</div>
            </div>

            <div style={styles.price}>
              {money(market?.priceUSD)}
            </div>

            <div
              style={{
                color:
                  market?.change24h >= 0
                    ? "#50e38b"
                    : "#ff6262",
                fontWeight: 800,
              }}
            >
              {market?.change24h !== undefined
                ? `${market.change24h >= 0 ? "+" : ""}${market.change24h.toFixed(
                    2
                  )}% (24h)`
                : "—"}
            </div>

            <div style={styles.grid}>
              <Metric
                styles={styles}
                label="Market Cap"
                value={compactMoney(market?.marketCapUSD)}
              />

              <Metric
                styles={styles}
                label="24h Volume"
                value={compactMoney(market?.volume24hUSD)}
              />

              <Metric
                styles={styles}
                label="Market Rank"
                value={
                  market?.marketCapRank
                    ? `#${market.marketCapRank}`
                    : "—"
                }
              />

              <Metric
                styles={styles}
                label="Mode"
                value={result.timeframe}
              />
            </div>

            {analysis && (
              <div style={styles.signal}>
                <p style={styles.signalTitle}>THEO SIGNAL</p>

                <div style={styles.verdict}>
                  {analysis.verdict || "WAIT"}
                </div>

                <div style={styles.grid}>
                  <Metric
                    styles={styles}
                    label="Theo Score"
                    value={`${analysis.score ?? "—"}/100`}
                  />

                  <Metric
                    styles={styles}
                    label="Trend"
                    value={analysis.trend || "—"}
                  />

                  <Metric
                    styles={styles}
                    label="Momentum"
                    value={analysis.momentum || "—"}
                  />

                  <Metric
                    styles={styles}
                    label="Risk"
                    value={analysis.risk || "—"}
                  />

                  <Metric
                    styles={styles}
                    label="Entry Low"
                    value={money(analysis.entryZone?.low)}
                  />

                  <Metric
                    styles={styles}
                    label="Entry High"
                    value={money(analysis.entryZone?.high)}
                  />

                  <Metric
                    styles={styles}
                    label="Invalidation"
                    value={money(analysis.invalidation)}
                  />

                  <Metric
                    styles={styles}
                    label="Target 1"
                    value={money(analysis.targets?.[0])}
                  />

                  <Metric
                    styles={styles}
                    label="Target 2"
                    value={money(analysis.targets?.[1])}
                  />

                  <Metric
                    styles={styles}
                    label="24h Range"
                    value={
                      analysis.range24h !== undefined
                        ? `${analysis.range24h.toFixed(2)}%`
                        : "—"
                    }
                  />

                  <Metric
                    styles={styles}
                    label="Recent Avg"
                    value={money(analysis.recentAverage)}
                  />

                  <Metric
                    styles={styles}
                    label="Period Change"
                    value={
                      analysis.periodChange !== undefined
                        ? `${analysis.periodChange >= 0 ? "+" : ""}${analysis.periodChange.toFixed(
                            2
                          )}%`
                        : "—"
                    }
                  />
                </div>
              </div>
            )}

            <p style={styles.summary}>{result.summary}</p>

            {result.framework && (
              <ul style={styles.list}>
                {result.framework.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}

            <div style={styles.source}>
              Data source: {result.source || "CoinGecko"} · Theo Analysis Engine
              v0.4
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, styles }) {
  return (
    <div style={styles.metric}>
      <div style={styles.metricLabel}>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}
