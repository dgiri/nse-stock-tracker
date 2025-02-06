import MarketHeader from "@/components/stocks/MarketHeader";
import NSEStockTracker from "@/components/stocks/NSEStockTracker";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <MarketHeader />
        <main className="p-4">
          <NSEStockTracker />
        </main>
      </div>
    </main>
  );
}
