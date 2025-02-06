import { NextResponse } from "next/server";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");
  const type = searchParams.get("type");
  const q = searchParams.get("q");

  if (!symbol && type !== "news") {
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
    // If type is news, focus on fetching news from multiple sources
    if (type === "news") {
      const newsPromises = [];

      // Add symbol-specific news search
      if (symbol) {
        newsPromises.push(
          fetch(
            `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
              symbol
            )}&news_type=all&type=news&count=20`,
            { headers }
          )
        );
      }

      // Add query-specific news search
      if (q) {
        newsPromises.push(
          fetch(
            `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
              q
            )}&news_type=all&type=news&count=20`,
            { headers }
          )
        );
      }

      // Add market news search
      newsPromises.push(
        fetch(
          `https://query2.finance.yahoo.com/v1/finance/search?q=Indian%20Stock%20Market&news_type=all&type=news&count=20`,
          { headers }
        )
      );

      const newsResponses = await Promise.all(newsPromises);
      const newsResults = await Promise.all(
        newsResponses.map((response) => response.json())
      );

      // Combine all news and remove duplicates
      const allNews = newsResults.reduce((acc, result) => {
        return [...acc, ...(result.news || [])];
      }, []);

      // Remove duplicates based on uuid
      const uniqueNews = Array.from(
        new Map(allNews.map((item) => [item.uuid, item])).values()
      );

      // Sort by publish time (most recent first)
      const sortedNews = uniqueNews.sort(
        (a, b) => b.providerPublishTime - a.providerPublishTime
      );

      return NextResponse.json({
        news: sortedNews,
        search: { news: sortedNews },
      });
    }

    // Fetch quote data with historical data (21 days)
    const quoteResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=21d&interval=1d&includePrePost=false&events=div%7Csplit%7Cearn`,
      { headers }
    );

    if (!quoteResponse.ok) {
      const errorMessage = await quoteResponse.text();
      return NextResponse.json(
        {
          error: "Failed to fetch stock data",
          details: errorMessage,
        },
        { status: 400 }
      );
    }
    const quoteData = await quoteResponse.json();
    // console.log("Yahoo API response:", quoteData?.chart?.result?.[0]?.meta);

    // Add a separate request for current quote data
    const currentQuoteResponse = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price`,
      { headers }
    );

    // let previousClose;
    if (currentQuoteResponse.ok) {
      // const currentQuoteData = await currentQuoteResponse.json();
      // console.log(
      //   "Current quote data:",
      //   currentQuoteData?.quoteSummary?.result?.[0]?.price
      // );
      // previousClose =
      //   currentQuoteData?.quoteSummary?.result?.[0]?.price
      //     ?.regularMarketPreviousClose?.raw;
      // console.log("Previous close from API:", previousClose);
    }

    // Extract quote and meta data
    const quote = quoteData?.chart?.result?.[0];
    const meta = quote?.meta || {};
    // const timestamps = quote?.timestamp || [];
    const prices = quote?.indicators?.quote?.[0]?.close || [];

    // Get previous close from historical data
    const previousCloseHistorical = prices[prices.length - 2] || null; // Second to last price

    // console.log("Previous close from historical:", previousCloseHistorical);

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

    return NextResponse.json({
      quote: {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: meta.regularMarketPrice,
                previousClose: previousCloseHistorical, // Use historical data for previous close
                regularMarketTime: meta.regularMarketTime,
                regularMarketDayHigh: meta.regularMarketDayHigh,
                regularMarketDayLow: meta.regularMarketDayLow,
                fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
                regularMarketVolume: meta.regularMarketVolume,
              },
            },
          ],
        },
      },
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
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch data" },
      { status: 500 }
    );
  }
}
