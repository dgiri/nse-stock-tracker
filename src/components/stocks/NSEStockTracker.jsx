"use client";

import React, { useState } from 'react';
import { Search, TrendingUp, Building2, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NSEStockTracker = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStockData = async (stockSymbol) => {
    setLoading(true);
    setError('');
    
    try {
      const yahooSymbol = stockSymbol.endsWith('.NS') ? stockSymbol : `${stockSymbol}.NS`;
      const response = await fetch(`/api/yahoo?symbol=${yahooSymbol}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      // Process the quote data
      const quote = data.quote?.chart?.result?.[0];
      const meta = quote?.meta || {};
      const price = meta.regularMarketPrice;
      const previousClose = meta.previousClose;
      const priceChange = price - previousClose;
      const priceChangePercent = (priceChange / previousClose) * 100;

      const processedData = {
        companyInfo: {
          name: data.search?.quotes?.[0]?.shortname || yahooSymbol,
          symbol: yahooSymbol,
          industry: data.search?.quotes?.[0]?.industry || 'N/A',
          description: data.search?.quotes?.[0]?.longBusinessSummary || 'No description available'
        },
        price: {
          current: price,
          previousClose: previousClose,
          change: priceChange,
          changePercent: priceChangePercent,
          dayHigh: meta.dayHigh,
          dayLow: meta.dayLow,
          volume: meta.regularMarketVolume,
          value: "₹",
          lastUpdateTime: new Date(meta.regularMarketTime * 1000).toLocaleTimeString()
        },
        news: data.news?.items || []
      };

      setStockData(processedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      fetchStockData(symbol.trim().toUpperCase());
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter NSE Symbol (e.g., TCS, INFY)"
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="text-center py-8">
          Loading...
        </div>
      )}

      {stockData && !loading && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-xl font-bold mb-2">{stockData.companyInfo.name}</h3>
              <p className="text-gray-600 mb-2">Symbol: {stockData.companyInfo.symbol}</p>
              <p className="text-gray-600 mb-2">Industry: {stockData.companyInfo.industry}</p>
              <p className="text-gray-700">{stockData.companyInfo.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Price Information
              </CardTitle>
              <div className="text-sm text-gray-500">
                Last Updated: {stockData.price.lastUpdateTime}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">
                {stockData.price.value}{stockData.price.current?.toFixed(2)}
              </div>
              <div className={`text-lg ${stockData.price.change >= 0 ? 'text-green-600' : 'text-red-600'} mb-4`}>
                {stockData.price.change >= 0 ? '+' : ''}{stockData.price.change?.toFixed(2)} 
                ({stockData.price.changePercent?.toFixed(2)}%)
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Day High</p>
                  <p className="font-semibold">{stockData.price.value}{stockData.price.dayHigh?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Day Low</p>
                  <p className="font-semibold">{stockData.price.value}{stockData.price.dayLow?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Volume</p>
                  <p className="font-semibold">{stockData.price.volume?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Prev Close</p>
                  <p className="font-semibold">{stockData.price.value}{stockData.price.previousClose?.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {stockData.news && stockData.news.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5" />
                  Recent News
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {stockData.news.map((item, index) => (
                    <li key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(item.providerPublishTime * 1000).toLocaleDateString()} • {item.publisher}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default NSEStockTracker;