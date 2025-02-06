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
    Origin: "https://finance.yahoo.com",
    Referer: "https://finance.yahoo.com",
  };

  try {
    // Fetch quote data with historical data (21 days)
    const quoteResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=21d&interval=1d`,
      { headers }
    );

    if (!quoteResponse.ok) {
      throw new Error("Failed to fetch quote data");
    }
    const quoteData = await quoteResponse.json();

    // Process historical data
    const historicalData = {
      dates: [],
      prices: [],
    };

    if (quoteData?.chart?.result?.[0]) {
      const timestamps = quoteData.chart.result[0].timestamp || [];
      const closePrices =
        quoteData.chart.result[0].indicators.quote[0].close || [];

      historicalData.dates = timestamps.map(
        (ts) => new Date(ts * 1000).toISOString().split("T")[0]
      );
      historicalData.prices = closePrices;
    }

    // Fetch company info using search endpoint
    const searchResponse = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}`,
      { headers }
    );

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch search data");
    }
    const searchData = await searchResponse.json();

    // Fetch supplementary company data
    const companyResponse = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryProfile,defaultKeyStatistics`,
      { headers }
    );

    let companyData = {};
    if (companyResponse.ok) {
      const companyResult = await companyResponse.json();
      companyData =
        companyResult?.quoteSummary?.result?.[0]?.summaryProfile || {};
    }

    // Fetch news data
    const newsResponse = await fetch(
      `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        searchData?.quotes?.[0]?.shortname || symbol
      )}&news_type=all&type=news`,
      { headers }
    );

    let newsData = { news: [] };
    if (newsResponse.ok) {
      const newsResult = await newsResponse.json();
      newsData.news = newsResult.news || [];
    }

    return NextResponse.json({
      quote: quoteData,
      search: searchData,
      profile: {
        ...companyData,
        description:
          companyData.longBusinessSummary ||
          searchData?.quotes?.[0]?.longBusinessSummary,
        industry: companyData.industry || searchData?.quotes?.[0]?.industry,
        sector: companyData.sector,
        website: companyData.website,
        employees: companyData.fullTimeEmployees,
      },
      historical: historicalData,
      news: newsData.news,
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
