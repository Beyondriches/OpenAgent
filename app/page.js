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

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: 10,
      marginTop: 18,
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

    section: {
      marginTop: 16,
      padding: 14,
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

    summary: {
      marginTop: 18,
      lineHeight: 1.55,
    },

    list: {
      lineHeight: 1.6,
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

  const tech = result?.technicals;
  const analysis = result?.analysis;
  const market = result?.market;

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <span style={styles.badge}>OpenAgent v0.9</span>

        <h1>Theo Crypto Agent</h1>

        <p style={styles.subtitle}>
          Multi-indicator crypto intelligence for long-term, swing and
          day-trading research.
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
                <div style={styles.subtitle}>{market?.name}</div>
              </div>

              <div style={styles.live}>● LIVE</div>
            </div>

            <div style={styles.price}>
              {money(market?.priceUSD)}
            </div>

            <div
              style={{
                fontWeight: 800,
                color: valueColor(market?.change24h),
              }}
            >
              {percent(market?.change24h)} (24h)
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
                value={`#${market?.marketCapRank}`}
                styles={styles}
              />

              <Metric
                label="Mode"
                value={result.timeframe}
                styles={styles}
              />
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>THEO SIGNAL</div>

              <div
                style={{
                  fontSize: 27,
                  fontWeight: 900,
                  color: signalColor(analysis?.verdict),
                  marginBottom: 14,
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
                  label="24h Range"
                  value={`${number(analysis?.range24h)}%`}
                  styles={styles}
                />

                <Metric
                  label="Recent Avg"
                  value={money(analysis?.recentAverage)}
                  styles={styles}
                />

                <Metric
                  label="7d Change"
                  value={percent(market?.change7d)}
                  styles={styles}
                />
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                TECHNICAL ENGINE
              </div>

              <div style={styles.grid}>
                <Metric
                  label="RSI 14"
                  value={number(tech?.rsi14, 1)}
                  styles={styles}
                />

                <Metric
                  label="SMA 7"
                  value={money(tech?.sma7)}
                  styles={styles}
                />

                <Metric
                  label="SMA 14"
                  value={money(tech?.sma14)}
                  styles={styles}
                />

                <Metric
                  label="SMA 30"
                  value={money(tech?.sma30)}
                  styles={styles}
                />

                <Metric
                  label="EMA 12"
                  value={money(tech?.ema12)}
                  styles={styles}
                />

                <Metric
                  label="EMA 26"
                  value={money(tech?.ema26)}
                  styles={styles}
                />

                <Metric
                  label="MACD"
                  value={number(tech?.macd, 4)}
                  styles={styles}
                />

                <Metric
                  label="MACD Signal"
                  value={number(tech?.macdSignal, 4)}
                  styles={styles}
                />

                <Metric
                  label="MACD Histogram"
                  value={number(tech?.macdHistogram, 4)}
                  styles={styles}
                />

                <Metric
                  label="14d Volatility"
                  value={`${number(tech?.volatility14d)}%`}
                  styles={styles}
                />

                <Metric
                  label="Recent High"
                  value={money(tech?.recentHigh)}
                  styles={styles}
                />

                <Metric
                  label="Recent Low"
                  value={money(tech?.recentLow)}
                  styles={styles}
                />
              </div>
            </div>

            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                BOLLINGER BANDS
              </div>

              <div style={styles.grid}>
                <Metric
                  label="Upper Band"
                  value={money(tech?.bollingerUpper)}
                  styles={styles}
                />

                <Metric
                  label="Middle Band"
                  value={money(tech?.bollingerMiddle)}
                  styles={styles}
                />

                <Metric
                  label="Lower Band"
                  value={money(tech?.bollingerLower)}
                  styles={styles}
                />

                <Metric
                  label="Band Width"
                  value={`${number(tech?.bollingerWidth)}%`}
                  styles={styles}
                />

                <Metric
                  label="Price Position"
                  value={tech?.bollingerPosition}
                  styles={styles}
                />
              </div>
            </div>

            <p style={styles.summary}>
              {result.summary}
            </p>

            <ul style={styles.list}>
              {result.framework?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
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
              Data source: {result.source} • Theo Multi-Indicator Engine v0.8
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
