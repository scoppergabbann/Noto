import { NextResponse } from "next/server";

type QuoteResult = {
  ticker: string;
  symbol: string;
  price: number | null;
  previousClose: number | null;
  changePercent: number | null;
  marketTime: number | null;
  name: string | null;
  currency: string;
  marketState: string | null;
  source: "yahoo";
};

function normalizeIdxSymbol(raw: string) {
  const clean = raw.trim().toUpperCase();

  if (!clean) return "";

  if (clean.endsWith(".JK")) return clean;

  return `${clean}.JK`;
}

function toBaseTicker(symbol: string) {
  return symbol.replace(".JK", "").toUpperCase();
}

async function fetchYahooQuote(symbol: string): Promise<QuoteResult> {
  const url = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
  url.searchParams.set("range", "1d");
  url.searchParams.set("interval", "1d");

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo request failed for ${symbol}: ${res.status}`);
  }

  const json = await res.json();

  const result = json?.chart?.result?.[0];
  const meta = result?.meta;

  if (!meta) {
    throw new Error(`Yahoo quote not found for ${symbol}`);
  }

  const price =
    typeof meta.regularMarketPrice === "number"
      ? meta.regularMarketPrice
      : typeof meta.previousClose === "number"
        ? meta.previousClose
        : null;

  const previousClose =
    typeof meta.previousClose === "number"
      ? meta.previousClose
      : typeof meta.chartPreviousClose === "number"
        ? meta.chartPreviousClose
        : null;

  const changePercent =
    price !== null && previousClose && previousClose > 0
      ? Math.round(((price - previousClose) / previousClose) * 100 * 100) / 100
      : null;

  return {
    ticker: toBaseTicker(symbol),
    symbol,
    price,
    previousClose,
    changePercent,
    marketTime:
      typeof meta.regularMarketTime === "number" ? meta.regularMarketTime : null,
    name: meta.longName || meta.shortName || meta.symbol || null,
    currency: meta.currency || "IDR",
    marketState: meta.marketState || null,
    source: "yahoo",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const symbolsParam = searchParams.get("symbols") || "";

  const symbols = Array.from(
    new Set(
      symbolsParam
        .split(",")
        .map((s) => normalizeIdxSymbol(s))
        .filter(Boolean)
    )
  );

  if (symbols.length === 0) {
    return NextResponse.json(
      {
        error: "symbols is required",
        quotes: {},
      },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.allSettled(symbols.map(fetchYahooQuote));

    const quotes: Record<string, QuoteResult> = {};
    const failed: string[] = [];

    results.forEach((result, index) => {
      const symbol = symbols[index];
      const baseTicker = toBaseTicker(symbol);

      if (result.status === "fulfilled") {
        quotes[baseTicker] = result.value;
      } else {
        failed.push(`${symbol}: ${result.reason?.message || "Unknown error"}`);
      }
    });

    return NextResponse.json({
      quotes,
      failed,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown market quote error",
        quotes: {},
      },
      { status: 500 }
    );
  }
}