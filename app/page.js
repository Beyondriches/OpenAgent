"use client";

import { useState } from "react";

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
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 10,
    border: "1px solid #36415a",
    background: "#0b1019",
    color: "#fff",
    fontSize: 16,
  },
  button: {
    width: "100%",
    padding: 13,
    border: 0,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
  },
  result: {
    marginTop: 22,
    padding: 18,
    borderRadius: 12,
    background: "#0b1019",
    border: "1px solid #273044",
    whiteSpace: "pre-wrap",
  },
};

export default function Home() {
  const [symbol, setSymbol] = useState("ETH");
  const [timeframe, setTimeframe] = useState("swing");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, timeframe }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <span style={styles.badge}>OpenAgent v0.2</span>
        <h1 style={{ fontSize: 36, marginBottom: 8 }}>Theo Crypto Agent</h1>
        <p style={{ color: "#aebbd2", lineHeight: 1.6 }}>
          Crypto research workspace for long-term core holdings and higher-risk
          trading ideas, kept operationally separate.
        </p>

        <label>Asset symbol</label>
        <input
          style={styles.input}
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="ETH"
        />

        <label>Mode</label>
        <select
          style={styles.input}
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="long-term">Long-term</option>
          <option value="swing">Swing</option>
          <option value="day">Day trade</option>
        </select>

        <button style={styles.button} onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {result && (
          <div style={styles.result}>
            <strong>{result.symbol || "Result"}</strong>
            <p>{result.summary || result.error}</p>
            {result.framework && (
              <ul>
                {result.framework.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
