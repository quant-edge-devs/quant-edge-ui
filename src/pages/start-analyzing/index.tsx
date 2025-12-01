import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

export const StartAnalyzing = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ ticker: string; name: string }[]>(
    []
  );
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [marketCaps, setMarketCaps] = useState<
    { ticker: string; marketCap: number }[]
  >([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickers = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const response = await fetch(
          `https://backend-service-1041518880178.us-central1.run.app/api/stocks?ticker=${query}`
        );
        const data = await response.json();
        setResults(
          (data.tickerResults || []).map((item: any) => ({
            ticker: item.ticker,
            name: item.name,
          }))
        );
        setIsDropdownOpen(true);
        console.log('fetched tickers:', data);
      } catch (error) {
        console.error('error fetching tickers:', error);
      }
    };
    const delayDebounce = setTimeout(fetchTickers, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (ticker: string) => {
    if (!selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker]);
    }

    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  const handleRemove = (ticker: string) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
    setMarketCaps(marketCaps.filter((mc) => mc.ticker !== ticker));
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-5xl">
      <h2 className="mb-6 text-center text-2xl font-semibold text-white">
        Start Analyzing Stocks
      </h2>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsDropdownOpen(true);
          }}
          placeholder="Search for stock tickers..."
          className="w-full rounded border border-gray-300 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

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
      </div>

      {selectedTickers.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium text-white">
            Selected tickers:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTickers.map((ticker, i) => (
              <div
                key={i}
                className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
              >
                {ticker}
                <button
                  onClick={() => handleRemove(ticker)}
                  className="ml-2 font-bold text-blue-500 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            className="mt-4 cursor-pointer rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-6 py-2 text-lg font-semibold text-white transition hover:from-fuchsia-600 hover:to-purple-600"
            onClick={() => navigate('/charting')}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};
