import React, { useState, useEffect } from "react";


export const StartAnalyzing = () => {

  const [query, setQuery] = useState("");
const [results, setResults] = useState<{ ticker: string; name: string }[]>([]);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchTickers = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
      const response = await fetch(`http://localhost:8080/api/stocks?ticker=${query}`);
      const data = await response.json();
      setResults((data.tickerResults || []).map((item: any) => ({
        ticker: item.ticker,
        name: item.name,
      })));
      setIsDropdownOpen(true);
      console.log("fetched tickers:", data);
    } catch (error) {
      console.error("error fetching tickers:", error);
    }
    
    }
    const delayDebounce = setTimeout(fetchTickers, 300);

    return () => clearTimeout(delayDebounce);
  }, [query])

  const handleSelect = (ticker: string) => {
    if (!selectedTickers.includes(ticker)) {
      setSelectedTickers([...selectedTickers, ticker]);
    }

    setQuery("");
    setResults([]);
    setIsDropdownOpen(false);
  }

    const handleRemove = (ticker: string) => {
      setSelectedTickers(selectedTickers.filter(t => t !== ticker));
    }

    return (
      <div className="w-full max-w-3xl mx-auto mt-10">
        {/* Header Section */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Start Analyzing Stocks
        </h2>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Search for stock tickers..."
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          {isDropdownOpen && results.length > 0 && (
<ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
    {results.map((item, i) => (
      <li
        key={i}
        onClick={() => handleSelect(item.ticker)}
        className="p-2 hover:bg-blue-50 cursor-pointer flex justify-between"
      >
        <span className="font-medium">{item.ticker}</span>
        <span className="text-gray-500 text-sm">{item.name}</span>
      </li>
    ))}
  </ul>
          )}
        </div>


      {selectedTickers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Selected tickers:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTickers.map((ticker, i) => (
              <div
                key={i}
                className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
              >
                {ticker}
                <button
                  onClick={() => handleRemove(ticker)}
                  className="ml-2 text-blue-500 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>
    )

};















  // const [ticker, setTicker] = useState("");
  // const [marketCap, setMarketCap] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const handleFetch = async () => {
  //   setLoading(true);
  //   setError(null);
  //   setMarketCap(null);
  //   try {
  //     const response = await fetch(
  //       `http://localhost:8080/api/stocks/${ticker}/marketCap`
  //     );
  //     if (!response.ok) throw new Error("Failed to fetch market cap");
  //     const data = await response.json();
  //     setMarketCap(data.marketCap ?? JSON.stringify(data));
  //   } catch (err: any) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // return (
  //   <div className="mt-10 flex flex-col items-center justify-center gap-4">
  //     <h2 className="text-lg">Contact us</h2>
  //     <div className="flex gap-2">
  //       <input
  //         type="text"
  //         placeholder="Enter ticker"
  //         value={ticker}
  //         onChange={(e) => setTicker(e.target.value)}
  //         className="border px-2 py-1 rounded"
  //       />
  //       <button
  //         onClick={handleFetch}
  //         disabled={!ticker || loading}
  //         className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-50"
  //       >
  //         {loading ? "Loading..." : "Get Market Cap"}
  //       </button>
  //     </div>
  //     {marketCap && (
  //       <div className="mt-2 text-green-700">Market Cap: {marketCap}</div>
  //     )}
  //     {error && <div className="mt-2 text-red-600">{error}</div>}
  //   </div>
  // )
