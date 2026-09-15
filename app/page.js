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

  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value < 10 ? 4 : 2,
    }).format(value);

  const bigMoney = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge}>OpenAgent v0.3 • LIVE</div>

        <h1 style={styles.title}>Theo Crypto Agent</h1>

        <p style={styles.subtitle}>
          Live crypto market intelligence for long-term, swing and day-trading
          research.
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
          <option value="day">Day trade</option>
        </select>

        <button
          style={styles.button}
          onClick={analyze}
          disabled={loading}
        >
          {loading ? "Loading live data..." : "Analyze"}
        </button>

        {error && <div style={styles.error}>{error}</div>}

        {result && (
          <div style={styles.result}>
            <div style={styles.resultHeader}>
              <div>
                <div style={styles.symbol}>{result.symbol}</div>
                <div style={styles.coinName}>{result.market.name}</div>
              </div>

              <div style={styles.live}>
                ● LIVE
              </div>
            </div>

            <div style={styles.price}>
              {money(result.market.priceUSD)}
            </div>

            <div
              style={{
                ...styles.change,
                color:
                  result.market.change24h >= 0
                    ? "#4ade80"
                    : "#f87171",
              }}
            >
              {result.market.change24h >= 0 ? "+" : ""}
              {result.market.change24h.toFixed(2)}% (24h)
            </div>

            <div style={styles.grid}>
              <div style={styles.metric}>
                <span style={styles.metricLabel}>Market Cap</span>
                <strong>
                  {bigMoney(result.market.marketCapUSD)}
                </strong>
              </div>

              <div style={styles.metric}>
                <span style={styles.metricLabel}>24h Volume</span>
                <strong>
                  {bigMoney(result.market.volume24hUSD)}
                </strong>
              </div>

              <div style={styles.metric}>
                <span style={styles.metricLabel}>Market Rank</span>
                <strong>
                  #{result.market.marketCapRank}
                </strong>
              </div>

              <div style={styles.metric}>
                <span style={styles.metricLabel}>Mode</span>
                <strong>{result.timeframe}</strong>
              </div>
            </div>

            <p style={styles.summary}>{result.summary}</p>

            <ul style={styles.list}>
              {result.framework.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>

            <div style={styles.source}>
              Data source: {result.source}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#080b12",
    color: "#f8fafc",
    fontFamily: "Arial, sans-serif",
    padding: "48px 20px",
  },

  card: {
    maxWidth: 760,
    margin: "0 auto",
    background: "#111827",
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
    color: "#86efac",
    fontSize: 13,
    marginBottom: 18,
  },

  title: {
    margin: "0 0 10px",
    fontSize: 34,
  },

  subtitle: {
    color: "#aebbd0",
    lineHeight: 1.6,
    marginBottom: 24,
  },

  label: {
    display: "block",
    marginTop: 14,
    marginBottom: 7,
    fontSize: 14,
    fontWeight: 600,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #36415a",
    background: "#0b1019",
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 10,
  },

  button: {
    width: "100%",
    padding: 13,
    marginTop: 8,
    border: 0,
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },

  result: {
    marginTop: 20,
    background: "#0b1019",
    border: "1px solid #273044",
    borderRadius: 14,
    padding: 20,
  },

  resultHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  symbol: {
    fontSize: 22,
    fontWeight: 800,
  },

  coinName: {
    color: "#94a3b8",
    marginTop: 3,
  },

  live: {
    color: "#4ade80",
    fontWeight: 700,
    fontSize: 13,
  },

  price: {
    fontSize: 36,
    fontWeight: 800,
    marginTop: 22,
  },

  change: {
    fontWeight: 700,
    marginTop: 5,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginTop: 22,
  },

  metric: {
    background: "#111827",
    border: "1px solid #273044",
    borderRadius: 10,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  metricLabel: {
    color: "#94a3b8",
    fontSize: 12,
  },

  summary: {
    marginTop: 22,
    lineHeight: 1.5,
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
    background: "#3f1515",
    border: "1px solid #7f1d1d",
    borderRadius: 10,
    padding: 14,
    color: "#fecaca",
  },
};
