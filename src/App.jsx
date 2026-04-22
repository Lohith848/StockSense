import { useState, useCallback, useEffect } from "react";
import "./index.css";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const POSITIVE_WORDS = ["bullish", "surge", "soar", "rally", "gain", "profit", "growth", "upbeat", "optimistic", "beat", "raise", "upgrade", "buy", "recommend", "strong", "breakout", "record", "high", "jump", "rise", "positive", "recovery", "rebound", "success", "boom", "boost"];
const NEGATIVE_WORDS = ["bearish", "crash", "plunge", "drop", "loss", "decline", "pessimistic", "downgrade", "sell", "weak", "breakdown", "low", "fall", "slide", "fear", "risk", "warning", "lawsuit", "investigation", "recall", "scandal", "miss", "fail", "bail", "bankruptcy", "concern", "pressure", "volatile"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function fetchNews(ticker) {
  const url = `/api/yahoo/search?q=${encodeURIComponent(ticker)}&quotesCount=1&newsCount=8`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Finance error: " + res.status);
  const data = await res.json();
  const news = data.news?.slice(0, 8) || [];
  return news.map(n => ({
    title: n.title,
    url: n.link,
    source: { name: n.publisher || "Yahoo Finance" },
    publishedAt: n.publishedAt || new Date().toISOString(),
  }));
}

function analyzeSentimentLocal(headlines, ticker) {
  let pos = 0, neg = 0, neu = 0;
  const perHeadline = headlines.map(title => {
    const tl = title.toLowerCase();
    const p = POSITIVE_WORDS.filter(w => tl.includes(w)).length;
    const n = NEGATIVE_WORDS.filter(w => tl.includes(w)).length;
    let s = "neutral";
    if (p > n) { s = "bullish"; pos++; }
    else if (n > p) { s = "bearish"; neg++; }
    else { neu++; }
    return { title, sentiment: s };
  });
  const total = pos + neg + neu || 1;
  let sentiment = "Neutral";
  if (pos > neg && pos > neu) sentiment = "Bullish";
  else if (neg > pos && neg > neu) sentiment = "Bearish";
  const confidence = Math.round(50 + Math.abs(pos - neg) / total * 30);
  const posPct = Math.round(pos / total * 100);
  const signalNews = pos > neg ? "positive" : neg > pos ? "negative" : "mixed";
  return {
    sentiment,
    confidence,
    summary: [
      sentiment === "Bullish" ? `${posPct}% of headlines show positive momentum for ${ticker}` : sentiment === "Bearish" ? `Negative news outweighs positive coverage for ${ticker}` : `Mixed signals - market appears uncertain about ${ticker}`,
      sentiment === "Bullish" ? "Key drivers: earnings beat, upgrade, or strong market sentiment" : sentiment === "Bearish" ? "Key concerns: profit warning, regulatory pressure, or sector weakness" : "No clear direction - awaits further catalysts",
      "Recent price action suggests consolidation before next move",
    ],
    signals: {
      news: signalNews,
      momentum: pos > neg ? "strong" : neg > pos ? "weak" : "neutral",
      risk: neg > pos ? "high" : pos > neg ? "low" : "medium",
    },
    per_headline: perHeadline,
    one_liner: sentiment === "Bullish" ? `Market feels optimistic about ${ticker} right now` : sentiment === "Bearish" ? `Concerns dominate the narrative around ${ticker}` : `No clear market consensus on ${ticker}`,
  };
}

// ─── STYLE HELPERS ───────────────────────────────────────────────────────────
const sentimentColor = {
  Bullish: { border: "#22c55e", text: "#22c55e", bg: "#166534" },
  Bearish: { border: "#ef4444", text: "#ef4444", bg: "#991b1b" },
  Neutral: { border: "#eab308", text: "#eab308", bg: "#854d0e" },
};
const sentimentEmoji = { Bullish: "▲", Bearish: "▼", Neutral: "●" };
const hsColors = { positive: "#22c55e", negative: "#ef4444", mixed: "#eab308", strong: "#22c55e", weak: "#ef4444", neutral: "#eab308", low: "#22c55e", medium: "#eab308", high: "#ef4444" };
const miniSentColors = { bullish: "#22c55e", bearish: "#ef4444", neutral: "#eab308" };

function getFearGreed(sentiment, confidence) {
  const base = sentiment === "Bullish" ? 60 : sentiment === "Bearish" ? 30 : 50;
  const adj = (confidence - 50) * 0.3;
  const val = Math.max(10, Math.min(90, base + adj));
  if (val < 25) return { label: "Extreme Fear", color: "#ef4444", pos: 10 };
  if (val < 45) return { label: "Fear", color: "#f87171", pos: 35 };
  if (val < 55) return { label: "Neutral", color: "#eab308", pos: 50 };
  if (val < 75) return { label: "Greed", color: "#4ade80", pos: 65 };
  return { label: "Extreme Greed", color: "#22c55e", pos: 90 };
}

const STEPS = ["Scanning market data...", "Reading news...", "Analyzing sentiment...", "Generating insights..."];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function App() {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState("search");

  const analyze = useCallback(async (sym) => {
    const t = (sym || ticker).trim().toUpperCase();
    if (!t) return;
    setLoading(true); setResult(null); setError(""); setStep(0);
    try {
      setStep(1);
      const arts = await fetchNews(t);
      if (!arts.length) throw new Error("No news found for this ticker.");
      setArticles(arts);
      setStep(2);
      await new Promise(r => setTimeout(r, 500));
      setStep(3);
      await new Promise(r => setTimeout(r, 400));
      const headlines = arts.map(a => a.title);
      const analysis = analyzeSentimentLocal(headlines, t);
      setStep(4);
      await new Promise(r => setTimeout(r, 300));
      setResult({ ...analysis, ticker: t });
      setHistory(prev => [t, ...prev.filter(x => x !== t)].slice(0, 6));
      setPage("results");
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    const handleKey = e => { if (e.key === "Enter") analyze(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [analyze]);

  const sc = result ? sentimentColor[result.sentiment] || sentimentColor.Neutral : null;
  const fg = result ? getFearGreed(result.sentiment, result.confidence) : null;

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-gradient" />

      {/* NAV */}
      <nav className="nav">
        <div className="nav-content">
          <div className="logo" onClick={() => setPage("search")}>
            <span className="logo-icon">◈</span>
            <span className="logo-text">STOCKSENSE</span>
            <span className="logo-badge">AI</span>
          </div>
          <div className="nav-links">
            <button className="nav-link" onClick={() => setPage("search")}>Analyze</button>
            <button className="nav-link" onClick={() => { setTicker(""); setResult(null); setPage("search"); }}>New Search</button>
          </div>
        </div>
      </nav>

      {/* SEARCH PAGE */}
      {page === "search" && (
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="title-line">Is the market</span>
              <span className="title-highlight">feeling greedy</span>
              <span className="title-line">or fearful?</span>
            </h1>
            <p className="hero-subtitle">AI-powered sentiment analysis. Know the mood before you trade.</p>

            <div className="search-wrapper">
              <div className="search-box">
                <span className="search-icon">⌕</span>
                <input
                  className="search-input"
                  value={ticker}
                  onChange={e => setTicker(e.target.value.toUpperCase())}
                  placeholder="Enter ticker — AAPL, TSLA, NVDA..."
                  maxLength={12}
                />
                <button className="analyze-btn" onClick={() => analyze()} disabled={loading || !ticker}>
                  ANALYZE →
                </button>
              </div>

              {history.length > 0 && (
                <div className="recent-searches">
                  <span className="recent-label">Recent:</span>
                  {history.map(h => (
                    <button key={h} className="recent-chip" onClick={() => { setTicker(h); analyze(h); }}>{h}</button>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="error-toast">{error}</div>}

            <div className="quick-stocks">
              {["AAPL", "TSLA", "NVDA", "GOOGL", "AMZN"].map(t => (
                <button key={t} className="quick-chip" onClick={() => { setTicker(t); analyze(t); }}>{t}</button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LOADING */}
      {loading && (
        <section className="loading">
          <div className="loader-container">
            <div className="loader-ring" />
            <div className="loader-pulse" />
          </div>
          <p className="loading-text">{STEPS[step - 1] || "Initializing..."}</p>
          <div className="step-dots">
            {STEPS.map((_, i) => (
              <div key={i} className={`step-dot ${i < step ? "active" : ""}`} />
            ))}
          </div>
        </section>
      )}

      {/* RESULTS PAGE */}
      {result && !loading && page === "results" && (
        <section className="results">
          {/* HEADER CARD */}
          <div className="result-header" style={{ borderColor: sc?.border }}>
            <div className="header-left">
              <span className="ticker-label">MARKET SENTIMENT FOR</span>
              <h1 className="ticker-symbol" style={{ color: sc?.text }}>{result.ticker}</h1>
            </div>
            <div className="sentiment-badge" style={{ borderColor: sc?.border, color: sc?.text, background: sc?.bg }}>
              <span>{sentimentEmoji[result.sentiment]}</span>
              <span>{result.sentiment}</span>
            </div>
          </div>

          {/* METERS ROW */}
          <div className="meters-row">
            <div className="meter-card">
              <div className="meter-header">
                <span>CONFIDENCE</span>
                <span className="meter-value" style={{ color: sc?.text }}>{result.confidence}%</span>
              </div>
              <div className="meter-track">
                <div className="meter-fill" style={{ width: `${result.confidence}%`, background: sc?.border }} />
              </div>
            </div>

            <div className="meter-card fear-greed">
              <div className="meter-header">
                <span>FEAR & GREED</span>
                <span className="meter-value" style={{ color: fg?.color }}>{fg?.label}</span>
              </div>
              <div className="fg-meter">
                <div className="fg-gradient" />
                <div className="fg-needle" style={{ left: `${fg?.pos}%`, background: fg?.color }} />
                <div className="fg-labels">
                  <span>Fear</span>
                  <span>Neutral</span>
                  <span>Greed</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI SUMMARY */}
          <div className="summary-card">
            <div className="card-header">
              <span className="card-icon">🧠</span>
              <span>AI Analysis</span>
            </div>
            <div className="verdict-box" style={{ borderLeftColor: sc?.border }}>
              "{result.one_liner}"
            </div>
            <ul className="summary-list">
              {result.summary?.map((s, i) => (
                <li key={i} className="summary-item">
                  <span className="bullet">▸</span> {s}
                </li>
              ))}
            </ul>
          </div>

          {/* SIGNALS GRID */}
          <div className="signals-grid">
            <div className="signal-card">
              <span className="signal-icon">📰</span>
              <span className="signal-label">News</span>
              <span className="signal-value" style={{ color: hsColors[result.signals?.news] }}>{result.signals?.news}</span>
            </div>
            <div className="signal-card">
              <span className="signal-icon">📈</span>
              <span className="signal-label">Momentum</span>
              <span className="signal-value" style={{ color: hsColors[result.signals?.momentum] }}>{result.signals?.momentum}</span>
            </div>
            <div className="signal-card">
              <span className="signal-icon">⚠️</span>
              <span className="signal-label">Risk</span>
              <span className="signal-value" style={{ color: hsColors[result.signals?.risk] }}>{result.signals?.risk}</span>
            </div>
          </div>

          {/* NEWS FEED */}
          <div className="news-section">
            <div className="card-header">
              <span className="card-icon">📰</span>
              <span>Recent Headlines</span>
            </div>
            <div className="news-list">
              {articles.slice(0, 8).map((a, i) => {
                const hs = result.per_headline?.[i]?.sentiment || "neutral";
                return (
                  <a key={i} href={a.url} target="_blank" rel="noreferrer" className="news-item" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="news-indicator" style={{ background: miniSentColors[hs] }}>
                      {hs === "bullish" ? "↑" : hs === "bearish" ? "↓" : "•"}
                    </div>
                    <div className="news-content">
                      <p className="news-title">{a.title}</p>
                      <p className="news-meta">{a.source?.name} · {a.publishedAt?.slice(0, 10)}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* DISCLAIMER */}
          <p className="disclaimer">
            ⚠ AI-generated sentiment analysis for educational purposes only. Not financial advice.
          </p>
        </section>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 StockSense · Powered by AI</p>
      </footer>
    </div>
  );
}