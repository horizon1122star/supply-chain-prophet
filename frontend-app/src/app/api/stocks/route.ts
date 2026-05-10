import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { resolveCompetitors } from "@/data/competitorMap";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});


export interface StockDataPoint {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: number[];   // 5-day close prices for sparkline
  currency: string;
}

export interface StocksApiResponse {
  sector: string;
  label: string;
  query: string;
  stocks: StockDataPoint[];
  error?: string;
}

// Helper to add a timeout to any promise
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error("Timeout")), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

async function fetchStockData(ticker: string): Promise<StockDataPoint | null> {
  try {
    // Fetch quote (current price + change) with 5s timeout
    const quote = await withTimeout(
      yahooFinance.quote(ticker, {
        fields: ["shortName", "regularMarketPrice", "regularMarketChange",
                 "regularMarketChangePercent", "currency"],
      }),
      5000
    );

    if (!quote.regularMarketPrice) return null;

    // Fetch 5-day historical close prices for sparkline
    const today   = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 9); // go back 9 days to ensure 5 trading days

    let history: number[] = [];
    try {
      const historical = await withTimeout(
        yahooFinance.chart(ticker, {
          period1: weekAgo.toISOString().split("T")[0],
          period2: today.toISOString().split("T")[0],
          interval: "1d",
        }),
        5000
      );

      history = (historical.quotes ?? [])
        .filter((q) => q.close !== null && q.close !== undefined)
        .map((q) => q.close as number)
        .slice(-5); // last 5 trading days
    } catch (chartErr) {
      console.error("Yahoo chart error for", ticker, chartErr);
      // If history fails, use flat line with current price
      history = Array(5).fill(quote.regularMarketPrice);
    }

    return {
      ticker,
      name:          quote.shortName ?? ticker,
      price:         quote.regularMarketPrice,
      change:        quote.regularMarketChange       ?? 0,
      changePercent: quote.regularMarketChangePercent ?? 0,
      history,
      currency:      quote.currency ?? "USD",
    };
  } catch (err) {
    console.error("Yahoo quote error for", ticker, err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json<StocksApiResponse>(
      { sector: "", label: "", query: "", stocks: [], error: "No query provided" },
      { status: 400 }
    );
  }

  const entry = resolveCompetitors(query);

  if (!entry) {
    return NextResponse.json<StocksApiResponse>(
      {
        sector: "Unknown",
        label:  `No competitor data for "${query}"`,
        query,
        stocks: [],
        error:  `No competitor map found for "${query}". Try: Apple, Tesla, Honda, Netflix, Amazon…`,
      },
      { status: 404 }
    );
  }

  // Fetch all tickers in parallel; filter out nulls
  const results = await Promise.all(entry.tickers.map(fetchStockData));
  const stocks  = results.filter((s): s is StockDataPoint => s !== null);

  return NextResponse.json<StocksApiResponse>({
    sector: entry.sector,
    label:  entry.label,
    query,
    stocks,
  });
}
