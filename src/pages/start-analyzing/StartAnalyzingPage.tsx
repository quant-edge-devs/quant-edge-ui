import { useState, useEffect } from 'react';
import VerticalNavbar from '../../components/navbar/VerticalNavbar';

type StockInfo = {
  ticker: string;
  name: string;
  price: string;
};

export const StartAnalyzing = () => {
  const [query, setQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);

  useEffect(() => {
    if (!selectedTicker) {
      setStockInfo(null);
      return;
    }
    setStockInfo({
      ticker: selectedTicker,
      name: 'Company Name Placeholder',
      price: '$123.45',
    });
  }, [selectedTicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSelectedTicker(query.trim().toUpperCase());
      setQuery('');
    }
  };

  const handleClear = () => {
    setSelectedTicker(null);
    setStockInfo(null);
    setQuery('');
  };

  return (
    <div className="font-inter flex min-h-screen bg-[#ede9ff] dark:bg-[#181425] text-gray-900 dark:text-white">
      <VerticalNavbar />
      <div className="flex-1">
        <div className="mx-auto mt-10 w-full max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Stock Information
          </h2>

          <form onSubmit={handleSubmit} className="relative mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a stock ticker (e.g. AAPL)"
              className="w-full rounded border border-black/[0.12] dark:border-gray-600 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              disabled={!!selectedTicker}
            />
            <button
              type="submit"
              className="absolute top-2 right-2 rounded bg-fuchsia-600 px-4 py-1 text-white hover:bg-fuchsia-700"
              disabled={!!selectedTicker || !query.trim()}
            >
              Submit
            </button>
          </form>

          {selectedTicker && stockInfo && (
            <div className="rounded-xl bg-[#ede9ff] dark:bg-[#181425] p-6 shadow-lg border border-black/[0.08] dark:border-white/[0.08]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{stockInfo.ticker}</h3>
                  <div className="text-purple-600 dark:text-purple-300">{stockInfo.name}</div>
                </div>
                <button
                  className="rounded bg-fuchsia-600 px-4 py-1 text-white hover:bg-fuchsia-700"
                  onClick={handleClear}
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-purple-600 dark:text-purple-200">Price</div>
                  <div className="text-lg">{stockInfo.price}</div>
                </div>
              </div>
            </div>
          )}

          {!selectedTicker && (
            <div className="mt-8 text-center text-purple-600 dark:text-purple-300">
              Enter a stock ticker to view its information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
