import React, { useState, useEffect, useCallback } from "react";
import { Newspaper, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";

interface NewsItem {
  title: string;
  publisher: string;
  providerPublishTime: number;
  link?: string;
}

interface NewsSectionProps {
  symbol: string;
  companyName: string;
}

const NewsSection: React.FC<NewsSectionProps> = ({ symbol, companyName }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchNews = useCallback(async (): Promise<void> => {
    if (!symbol) return;

    setLoading(true);
    setError("");

    try {
      const searchTerm = encodeURIComponent(companyName || symbol);
      const response = await fetch(
        `/api/yahoo?symbol=${symbol}&type=news&q=${searchTerm}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch news");
      }

      setNews(data.news || []);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to fetch news. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [symbol, companyName]);

  useEffect(() => {
    fetchNews();
  }, [symbol, companyName, fetchNews]);

  useEffect(() => {
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbol, companyName, fetchNews]);

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5" />
            Recent News & Events
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNews}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading && news.length === 0 && (
          <div className="text-center py-4">Loading news...</div>
        )}

        {news.length > 0 ? (
          <ul className="space-y-4">
            {news.map((item, index) => (
              <li key={index} className="border-b pb-4 last:border-b-0">
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>
                    {new Date(
                      item.providerPublishTime * 1000
                    ).toLocaleDateString()}
                  </span>
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
        ) : (
          !loading && (
            <p className="text-center py-4 text-gray-500">No news available</p>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default NewsSection;
