import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Symbol parameter is required" },
      { status: 400 }
    );
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Accept-Language": "en-US,en;q=0.9",
  };

  try {
    // Fetch quote data
    console.log("Fetching quote data for symbol:", symbol);
    const quoteResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { headers }
    );

    if (!quoteResponse.ok) {
      console.error("Quote response not OK:", await quoteResponse.text());
      throw new Error("Failed to fetch quote data");
    }

    const quoteData = await quoteResponse.json();

    // Fetch company info
    console.log("Fetching company info");
    const searchResponse = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}`,
      { headers }
    );

    if (!searchResponse.ok) {
      console.error("Search response not OK:", await searchResponse.text());
      throw new Error("Failed to fetch company info");
    }

    const searchData = await searchResponse.json();

    // Try to fetch news using a more reliable endpoint
    let newsData = { items: [] }; // Default empty news
    try {
      console.log("Fetching news data");
      const newsResponse = await fetch(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&type=news`,
        { headers }
      );

      if (newsResponse.ok) {
        const rawNewsData = await newsResponse.json();
        newsData = {
          items: rawNewsData.news || [],
        };
      } else {
        console.log("News fetch failed, continuing with empty news");
      }
    } catch (newsError) {
      console.log("News fetch error, continuing with empty news:", newsError);
    }

    return NextResponse.json({
      quote: quoteData,
      search: searchData,
      news: newsData,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
