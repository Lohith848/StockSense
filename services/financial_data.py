import os
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

NEWSAPI_API_KEY = os.getenv("NEWSAPI_API_KEY")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query"
NEWSAPI_BASE_URL = "https://newsapi.org/v2"


class FinancialDataService:
    def __init__(self):
        self.alpha_vantage_api_key = ALPHA_VANTAGE_API_KEY
        self.newsapi_api_key = NEWSAPI_API_KEY

    def _make_alpha_vantage_request(self, params):
        try:
            params["apikey"] = self.alpha_vantage_api_key
            response = requests.get(ALPHA_VANTAGE_BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

    def _make_newsapi_request(self, endpoint, params):
        try:
            params["apiKey"] = self.newsapi_api_key
            response = requests.get(
                f"{NEWSAPI_BASE_URL}/{endpoint}", params=params, timeout=10
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

    def get_stock_quote(self, symbol):
        params = {"function": "GLOBAL_QUOTE", "symbol": symbol}
        return self._make_alpha_vantage_request(params)

    def get_intraday_stock_data(self, symbol, interval=5):
        params = {
            "function": "TIME_SERIES_INTRADAY",
            "symbol": symbol,
            "interval": f"{interval}min",
            "outputsize": "compact",
        }
        return self._make_alpha_vantage_request(params)

    def get_daily_stock_data(self, symbol):
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": "compact",
        }
        return self._make_alpha_vantage_request(params)

    def get_company_overview(self, symbol):
        params = {"function": "OVERVIEW", "symbol": symbol}
        return self._make_alpha_vantage_request(params)

    def get_financial_news(self, query="stock market", max_results=10):
        params = {
            "q": query,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": max_results,
        }
        return self._make_newsapi_request("everything", params)

    def get_top_headlines(self, category="business", country="us"):
        params = {"category": category, "country": country}
        return self._make_newsapi_request("top-headlines", params)

    def get_market_data_with_fallback(self, symbol):
        result = {"source": None, "data": None, "error": None}

        data = self.get_daily_stock_data(symbol)
        if "Time Series (Daily)" in data or "Global Quote" in data:
            result["source"] = "alpha_vantage"
            result["data"] = data
        else:
            result["source"] = "fallback"
            result["error"] = data.get("error", "Alpha Vantage unavailable")

            news_data = self.get_financial_news(f"{symbol} stock", 5)
            if "articles" in news_data and news_data["articles"]:
                result["source"] = "newsapi_fallback"
                result["data"] = news_data

        return result

    def get_financial_info_with_fallback(self, symbol):
        result = {
            "source": None,
            "quote": None,
            "overview": None,
            "news": None,
            "error": None,
        }

        quote_data = self.get_stock_quote(symbol)
        if "Global Quote" in quote_data and quote_data["Global Quote"]:
            result["source"] = "alpha_vantage"
            result["quote"] = quote_data["Global Quote"]

            overview_data = self.get_company_overview(symbol)
            if overview_data:
                result["overview"] = overview_data
        else:
            result["error"] = quote_data.get("error", "Alpha Vantage unavailable")

        news_data = self.get_financial_news(f"{symbol} financial news", 10)
        if "articles" in news_data:
            result["news"] = news_data["articles"]

        if result["quote"] is None and result["news"] is None:
            result["error"] = "All data sources unavailable"

        return result


financial_service = FinancialDataService()

if __name__ == "__main__":
    print("Testing FinancialDataService...")

    print("\n1. Stock Quote (AAPL):")
    quote = financial_service.get_stock_quote("AAPL")
    print(quote)

    print("\n2. Financial News:")
    news = financial_service.get_financial_news("stock market", 5)
    print(news)

    print("\n3. Market Data with Fallback (AAPL):")
    market_data = financial_service.get_market_data_with_fallback("AAPL")
    print(market_data)

    print("\n4. Financial Info with Fallback (AAPL):")
    fin_info = financial_service.get_financial_info_with_fallback("AAPL")
    print(fin_info)
