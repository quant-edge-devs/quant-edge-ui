import { useState, useEffect } from 'react';
import VerticalNavbar from '../../components/navbar/VerticalNavbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type StockInfo = {
  ticker: string;
  name: string;
  price: string;
  // add more fields when needed
};

export const StartAnalyzing = () => {
  const [query, setQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);

  // --- Old backend search implementation (commented out) ---
  /*
  useEffect(() => {
    const fetchTickers = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const response = await fetch(`${API_BASE_URL}/stocks?ticker=${query}`);
        const data = await response.json();
        setResults(
          (data.tickerResults || []).map((item: any) => ({
            ticker: item.ticker,
            name: item.name,
          }))
        );
        setIsDropdownOpen(true);
      } catch (error) {
        setResults([]);
      }
    };
    const delayDebounce = setTimeout(fetchTickers, 10);
    return () => clearTimeout(delayDebounce);
  }, [query]);
  */

  // Fetch stock info when a ticker is selected
  useEffect(() => {
    if (!selectedTicker) {
      setStockInfo(null);
      return;
    }
    // TODO: Replace with your actual API call for stock info
    // For now, we'll use mock data
    setStockInfo({
      ticker: selectedTicker,
      name: 'Company Name Placeholder',
      price: '$123.45',
      // Add more fields as needed
    });
  }, [selectedTicker]);

  // New: handle ticker submit
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
    // setResults([]);
    // setIsDropdownOpen(false);
  };

  return (
    <div className="font-inter flex min-h-screen bg-[#181425] text-white">
      <VerticalNavbar />
      <div className="flex-1">
        <div className="mx-auto mt-10 w-full max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold text-white">
            Stock Information
          </h2>

          {/* Ticker Input (no backend search) */}
          <form onSubmit={handleSubmit} className="relative mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a stock ticker (e.g. AAPL)"
              className="w-full rounded border border-gray-300 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={!!selectedTicker}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 rounded bg-fuchsia-600 px-4 py-1 text-white hover:bg-fuchsia-700"
              disabled={!!selectedTicker || !query.trim()}
            >
              Submit
            </button>
          </form>

          {/* --- Old dropdown UI (commented out) --- */}
          {/*
          {isDropdownOpen && results.length > 0 && (
            <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {results.map((item, i) => (
                <li
                  key={i}
                  onClick={() => handleSelect(item.ticker)}
                  className="flex cursor-pointer justify-between p-2 hover:bg-blue-50"
                >
                  <span className="font-medium">{item.ticker}</span>
                  <span className="text-sm text-gray-500">{item.name}</span>
                </li>
              ))}
            </ul>
          )}
          */}

          {/* Stock Info Section */}
          {selectedTicker && stockInfo && (
            <div className="rounded-xl bg-[#181425] p-6 text-white shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{stockInfo.ticker}</h3>
                  <div className="text-purple-300">{stockInfo.name}</div>
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
                  <div className="text-sm text-purple-200">Price</div>
                  <div className="text-lg">{stockInfo.price}</div>
                </div>
                {/* Add more info fields as needed */}
              </div>
            </div>
          )}

          {!selectedTicker && (
            <div className="mt-8 text-center text-purple-300">
              Enter a stock ticker to view its information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
