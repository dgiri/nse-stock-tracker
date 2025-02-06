"use client"
import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Building2, Newspaper, Plus, X, Star, BookmarkPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NSEStockTracker = () => {
  const [symbol, setSymbol] = useState('');
  const [watchlistSymbol, setWatchlistSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistError, setWatchlistError] = useState('');

  // Load watchlist from localStorage on component mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('stockWatchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('stockWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

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
          industry: data.profile?.industry || data.search?.quotes?.[0]?.industry || 'N/A',
          sector: data.profile?.sector || 'N/A',
          description: data.profile?.description || 
                      data.search?.quotes?.[0]?.longBusinessSummary || 
                      'No description available',
          website: data.profile?.website || 'N/A',
          employees: data.profile?.employees || 'N/A'
        },
        price: {
          current: price,
          previousClose: previousClose,
          change: priceChange,
          changePercent: priceChangePercent,
          dayHigh: meta.regularMarketDayHigh,
          dayLow: meta.regularMarketDayLow,
          fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
          volume: meta.regularMarketVolume,
          value: "₹",
          lastUpdateTime: new Date(meta.regularMarketTime * 1000).toLocaleTimeString()
        },
        news: data.news?.map(item => ({
          title: item.title,
          publisher: item.publisher,
          providerPublishTime: item.providerPublishTime,
          link: item.link
        })) || []
      };

      setStockData(processedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateStock = async (stockSymbol) => {
    try {
      const yahooSymbol = stockSymbol.endsWith('.NS') ? stockSymbol : `${stockSymbol}.NS`;
      const response = await fetch(`/api/yahoo?symbol=${yahooSymbol}`);
      const data = await response.json();
      
      if (!response.ok || !data.quote?.chart?.result?.[0]?.meta?.regularMarketPrice) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  };

  const addToWatchlist = async (e) => {
    e?.preventDefault();
    setWatchlistError('');
    
    if (!watchlistSymbol && !stockData) return;
    
    // Remove .NS from the symbol if present
    let symbolToAdd = (watchlistSymbol || stockData.companyInfo.symbol).trim().toUpperCase();
    symbolToAdd = symbolToAdd.replace('.NS', '');
    
    // Check if already in watchlist
    if (watchlist.includes(symbolToAdd)) {
      setWatchlistError('Stock already in watchlist');
      return;
    }
  
    // Validate stock
    const isValid = await validateStock(symbolToAdd);
    if (!isValid) {
      setWatchlistError('Invalid stock symbol');
      return;
    }
  
    setWatchlist([...watchlist, symbolToAdd]);
    setWatchlistSymbol('');
  };

  const removeFromWatchlist = (symbolToRemove) => {
    setWatchlist(watchlist.filter(sym => sym !== symbolToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      fetchStockData(symbol.trim().toUpperCase());
    }
  };

  return (
    <div className="flex gap-4 max-w-6xl mx-auto p-4">
      {/* Watchlist Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Watchlist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addToWatchlist} className="mb-4">
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={watchlistSymbol}
                  onChange={(e) => setWatchlistSymbol(e.target.value)}
                  placeholder="Add symbol..."
                  className="flex-1"
                />
                <Button type="submit" size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {watchlistError && (
                <p className="text-sm text-red-500 mb-2">{watchlistError}</p>
              )}
            </form>
            <ul className="space-y-2">
              {watchlist.map((sym) => (
                <li key={sym} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <button
                    onClick={() => fetchStockData(sym)}
                    className="text-sm hover:text-primary"
                  >
                    {sym}
                  </button>
                  <button
                    onClick={() => removeFromWatchlist(sym)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
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
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </div>
                  {!watchlist.includes(stockData.companyInfo.symbol) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addToWatchlist()}
                      className="flex items-center gap-1"
                    >
                      <BookmarkPlus className="w-4 h-4" />
                      Add to Watchlist
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold mb-2">{stockData.companyInfo.name}</h3>
                <div className="space-y-2">
                  <p className="text-gray-600">Symbol: {stockData.companyInfo.symbol}</p>
                  <p className="text-gray-600">Industry: {stockData.companyInfo.industry}</p>
                  <p className="text-gray-600">Sector: {stockData.companyInfo.sector}</p>
                  {stockData.companyInfo.website !== 'N/A' && (
                    <p className="text-gray-600">
                      Website: <a href={stockData.companyInfo.website} target="_blank" rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline">
                        {stockData.companyInfo.website}
                      </a>
                    </p>
                  )}
                  <p className="text-gray-600">Location: {stockData.companyInfo.location}</p>
                  {stockData.companyInfo.employees !== 'N/A' && (
                    <p className="text-gray-600">Employees: {stockData.companyInfo.employees.toLocaleString()}</p>
                  )}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">About</h4>
                    <p className="text-gray-700">{stockData.companyInfo.description}</p>
                  </div>
                </div>
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

                {/* Day's Range */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Day's Range</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>{stockData.price.value}{stockData.price.dayLow?.toFixed(2)}</span>
                    <span>{stockData.price.value}{stockData.price.current?.toFixed(2)}</span>
                    <span>{stockData.price.value}{stockData.price.dayHigh?.toFixed(2)}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full relative">
                    {stockData.price.dayLow && stockData.price.dayHigh && stockData.price.current && (
                      <div 
                        className="h-full bg-blue-500 rounded-full absolute"
                        style={{
                          left: '0%',
                          width: `${((stockData.price.current - stockData.price.dayLow) / 
                            (stockData.price.dayHigh - stockData.price.dayLow) * 100)}%`
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">52 Week High</p>
                    <p className="font-semibold">
                      {stockData.price.value}
                      {stockData.price.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">52 Week Low</p>
                    <p className="font-semibold">
                      {stockData.price.value}
                      {stockData.price.fiftyTwoWeekLow?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Volume</p>
                    <p className="font-semibold">{stockData.price.volume?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Prev Close</p>
                    <p className="font-semibold">
                      {stockData.price.value}
                      {stockData.price.previousClose?.toFixed(2) || 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {stockData.news && stockData.news.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5" />
                    Recent News & Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {stockData.news.map((item, index) => (
                      <li key={index} className="border-b pb-4 last:border-b-0">
                        <h4 className="font-semibold mb-1">{item.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{new Date(item.providerPublishTime * 1000).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{item.publisher}</span>
                          {item.link && (
                            <>
                              <span>•</span>
                              <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Read More
                              </a>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NSEStockTracker;