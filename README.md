# 📊 StockSense

> **Know what the market is feeling. Right now.**
> AI-powered stock sentiment analyzer — Bullish, Bearish, or Neutral in seconds.

🔗 **Live Demo:** [StockSense.vercel.app](https://StockSense.vercel.app)

---

## What is StockSense?

**StockSense** is a web application that analyzes real-time stock news and market data for any ticker symbol and returns a clear sentiment signal — **Bullish , Bearish , or Neutral ** — along with a plain-English explanation of why.

Built for retail investors who don't have time to read 50 articles before making a trade decision.

---

## Features

- **Ticker Search** — Enter any stock symbol (AAPL, TSLA, RELIANCE, NIFTY50, etc.)
- **Sentiment Score** — Bullish / Bearish / Neutral with confidence level
- **Live News Feed** — Latest headlines fetched in real-time via NewsAPI
- **Alpha Vantage Integration** — Real market data via Alpha Vantage API
- **Per-Headline Tags** — Each headline individually labeled with its sentiment
- **Key Market Signals** — News tone, momentum, and risk indicators
- **Fast & Clean UI** — Results in under 10 seconds

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React + Vite |
| **News Data** | [NewsAPI.org](https://newsapi.org) |
| **Market Data** | [Alpha Vantage](https://www.alphavantage.co/) API |
| **Sentiment Logic** | Rule-based analysis + Alpha Vantage signals |
| **Hosting** | [Vercel](https://vercel.com) |

---

## 📸 How It Works

```
User types: AAPL
      ↓
NewsAPI → fetches latest headlines
Alpha Vantage → fetches price, change %, trend
      ↓
Sentiment Engine → analyzes both signals
      ↓
Result: BULLISH 🟢 — with confidence score
+ plain-English summary of why
+ tagged headlines + key signals
```

---

## 🔧 Getting Started (Run Locally)

### 1. Clone the repo
```bash
git clone https://github.com/Lohith848/StockSense.git
cd StockSense
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:
```env
VITE_NEWS_API_KEY=your_newsapi_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alphavantage_key_here
```

> 🔑 Get a free NewsAPI key at [newsapi.org/register](https://newsapi.org/register)
>
> 🔑 Get a free Alpha Vantage key at [alphavantage.co/support#api-key](https://www.alphavantage.co/support#api-key)

### 4. Run the development server
```bash
npm run dev
```

App runs at `http://localhost:5173`

---

##  Deploy on Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo directly at [vercel.com](https://vercel.com) for automatic deployments on every push.

---

## 📁 Project Structure

```
StockSense/
├── public/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx
│   │   ├── SentimentBadge.jsx
│   │   ├── NewsFeed.jsx
│   │   ├── SummaryPanel.jsx
│   │   └── SignalsGrid.jsx
│   ├── services/
│   │   ├── newsApi.js              ← NewsAPI integration
│   │   └── financial_data.py       ← Alpha Vantage data (Python)
│   ├── App.jsx
│   └── main.jsx
├── .env                        ← API keys (never commit this)
├── .gitignore
├── package.json
└── README.md
```

---

## ⚠️ Disclaimer

StockSense is built for **educational and portfolio purposes only.**
Sentiment scores and summaries are **not financial advice.**
Always do your own research before making any investment decisions.

---

## Author

**Lohith** — [@Lohith848](https://github.com/Lohith848)

---

## 📌 Roadmap

- [ ] Fear & Greed visual meter
- [ ] Multi-stock comparison mode
- [ ] Watchlist with daily digest
- [ ] Export report as PDF
- [ ] Mobile app version

---

## ⭐ Support

If you find this useful, drop a ⭐ on the repo — it helps a lot!
