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
        headers: { "Content-Type": "application/json" },
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

  const money = (value) => {
    if (value === undefined || value === null) return "-";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value < 10 ? 4 : 2,
    }).format(value);
  };

  const compactMoney = (value) => {
    if (value === undefined || value === null) return "-";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const verdictColor = {
    BUY: "#38d996",
    WAIT: "#f6c453",
    AVOID: "#ff646e",
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
      padding: 13,
      marginTop: 16,
      border: 0,
      borderRadius: 10,
      cursor: "pointer",
      fontWeight: 800,
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
      gap: 16,
      alignItems: "flex-start",
    },

    live: {
      color: "#38d996",
      fontSize: 12,
      fontWeight: 800,
    },

    price: {
      fontSize: 34,
      fontWeight: 900,
      margin: "22px 0 4px",
    },

    change: {
      fontWeight: 800,
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
      gap: 10,
      marginTop: 20,
    },

    metric: {
      background: "#111827",
      border: "1px solid #273044",
      borderRadius: 10,
      padding: 12,
      minHeight: 52,
    },

    metricLabel: {
      color: "#94a3b8",
      fontSize: 12,
      marginBottom: 6,
    },

    metricValue: {
      fontWeight: 800,
      fontSize: 15,
    },

    signal: {
      marginTop: 16,
      padding: 16,
      background: "#111827",
      border: "1px solid #36415a",
      borderRadius: 12,
    },

    signalTitle: {
      color: "#8fa3c3",
      fontSize: 12,
      letterSpacing: 1.5,
      marginBottom: 8,
    },

    verdict: {
      fontSize: 28,
      fontWeight: 900,
      marginBottom: 14,
    },

    technical: {
      marginTop: 16,
      padding: 16,
      background: "#0d1420",
      border: "1px solid #273044",
      borderRadius: 12,
    },

    technicalTitle: {
      color: "#8fa3c3",
      fontSize: 12,
      letterSpacing: 1.5,
      marginBottom: 12,
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
      color: "#7484a0",
      fontSize: 12,
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

  const a = result?.analysis;
  const t = result?.technicals;
  const m = result?.market;

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <span style={styles.badge}>OpenAgent v0.7</span>

        <h1>Theo Crypto Agent</h1>

        <p style={styles.subtitle}>
          Live crypto market intelligence with technical analysis for
          long-term, swing and day-trading research.
        </p>

        <label style={styles.label}>Asset symbol</label>

        <input
          style={styles.input}
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="ETH"
        />

        <label style={styles.label}>Mode</label>

        <select
          style={styles.input}
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
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
          <div style={styles.result}>
            <div style={styles.topRow}>
              <div>
                <h2 style={{ margin: 0 }}>{result.symbol}</h2>

                <div style={{ color: "#94a3b8", marginTop: 4 }}>
                  {m?.name}
                </div>
              </div>

              <div style={styles.live}>● LIVE</div>
            </div>

            <div style={styles.price}>{money(m?.priceUSD)}</div>

            <div
              style={{
                ...styles.change,
                color:
                  m?.change24h >= 0 ? "#38d996" : "#ff646e",
              }}
            >
              {m?.change24h >= 0 ? "+" : ""}
              {Number(m?.change24h || 0).toFixed(2)}% (24h)
            </div>

            <div style={styles.grid}>
              <Metric
                label="Market Cap"
                value={compactMoney(m?.marketCapUSD)}
                styles={styles}
              />

              <Metric
                label="24h Volume"
                value={compactMoney(m?.volume24hUSD)}
                styles={styles}
              />

              <Metric
                label="Market Rank"
                value={`#${m?.marketCapRank}`}
                styles={styles}
              />

              <Metric
                label="Mode"
                value={result.timeframe}
                styles={styles}
              />
            </div>

            <div style={styles.signal}>
              <div style={styles.signalTitle}>THEO SIGNAL</div>

              <div
                style={{
                  ...styles.verdict,
                  color: verdictColor[a?.verdict] || "#fff",
                }}
              >
                {a?.verdict}
              </div>

              <div style={styles.grid}>
                <Metric
                  label="Theo Score"
                  value={`${a?.score}/100`}
                  styles={styles}
                />

                <Metric
                  label="Trend"
                  value={a?.trend}
                  styles={styles}
                />

                <Metric
                  label="Momentum"
                  value={a?.momentum}
                  styles={styles}
                />

                <Metric
                  label="Risk"
                  value={a?.risk}
                  styles={styles}
                />

                <Metric
                  label="Entry Low"
                  value={money(a?.entryZone?.low)}
                  styles={styles}
                />

                <Metric
                  label="Entry High"
                  value={money(a?.entryZone?.high)}
                  styles={styles}
                />

                <Metric
                  label="Invalidation"
                  value={money(a?.invalidation)}
                  styles={styles}
                />

                <Metric
                  label="Target 1"
                  value={money(a?.targets?.[0])}
                  styles={styles}
                />

                <Metric
                  label="Target 2"
                  value={money(a?.targets?.[1])}
                  styles={styles}
                />

                <Metric
                  label="24h Range"
                  value={`${a?.range24h}%`}
                  styles={styles}
                />

                <Metric
                  label="Recent Avg"
                  value={money(a?.recentAverage)}
                  styles={styles}
                />

                <Metric
                  label="7d Change"
                  value={`${a?.periodChange >= 0 ? "+" : ""}${a?.periodChange}%`}
                  styles={styles}
                />
              </div>

              <div style={styles.technical}>
                <div style={styles.technicalTitle}>
                  TECHNICAL ENGINE
                </div>

                <div style={styles.grid}>
                  <Metric
                    label="RSI 14"
                    value={
                      t?.rsi14 === null ||
                      t?.rsi14 === undefined
                        ? "N/A"
                        : t.rsi14
                    }
                    styles={styles}
                  />

                  <Metric
                    label="SMA 7"
                    value={money(t?.sma7)}
                    styles={styles}
                  />

                  <Metric
                    label="SMA 14"
                    value={money(t?.sma14)}
                    styles={styles}
                  />

                  <Metric
                    label="SMA 30"
                    value={money(t?.sma30)}
                    styles={styles}
                  />

                  <Metric
                    label="14d Volatility"
                    value={`${t?.volatility14d}%`}
                    styles={styles}
                  />

                  <Metric
                    label="Recent High"
                    value={money(t?.recentHigh)}
                    styles={styles}
                  />

                  <Metric
                    label="Recent Low"
                    value={money(t?.recentLow)}
                    styles={styles}
                  />

                  <Metric
                    label="30d Change"
                    value={`${
                      m?.change30d >= 0 ? "+" : ""
                    }${Number(m?.change30d || 0).toFixed(2)}%`}
                    styles={styles}
                  />
                </div>
              </div>
            </div>

            <p style={styles.summary}>{result.summary}</p>

            <ul style={styles.list}>
              {(result.framework || []).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <div style={styles.source}>
              Data source: {result.source} • Theo Technical Analysis
              Engine
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
      <div style={styles.metricValue}>{value}</div>
    </div>
  );
}
