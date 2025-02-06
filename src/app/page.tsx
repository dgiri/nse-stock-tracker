import NSEStockTracker from "@/components/stocks/NSEStockTracker";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          NSE Stock Tracker
        </h1>
        <NSEStockTracker />
      </div>
    </main>
  );
}
