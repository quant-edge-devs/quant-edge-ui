import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

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

  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const fetchTickers = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8080/api/stocks?ticker=${query}`
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

  useEffect(() => {
    const fetchMarketCaps = async () => {
      const data: { ticker: string; marketCap: number }[] = [];
      for (const ticker of selectedTickers) {
        try {
          const res = await fetch(
            `http://localhost:8080/api/stocks/${ticker}/marketCap`
          );
          const json = await res.json();
          data.push({ ticker: json.ticker, marketCap: json.marketCap });
        } catch (err) {
          console.error(`Error fetching market cap for ${ticker}:`, err);
        }
      }
      setMarketCaps(data);
    };
    if (selectedTickers.length > 0) {
      fetchMarketCaps();
    } else {
      setMarketCaps([]);
    }
  }, [selectedTickers]);

  // --- Render D3 Chart ---
  useEffect(() => {
    if (!chartRef.current) return;
    const svg = d3.select(chartRef.current);
    svg.selectAll('*').remove();

    const width = 600;
    const height = 400;
    const margin = { top: 30, right: 30, bottom: 50, left: 80 };

    svg.attr('width', width).attr('height', height);

    if (marketCaps.length === 0) return;

    const x = d3
      .scaleBand()
      .domain(marketCaps.map((d) => d.ticker))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(marketCaps, (d) => d.marketCap)!])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    const tooltip = d3
      .select('body')
      .append('div')
      .style('position', 'absolute')
      .style('background', '#fff');

    const formatMarketCap = (d: number) => {
      if (d >= 1e12) return `$${(d / 1e12).toFixed(2)}T`;
      if (d >= 1e9) return `$${(d / 1e9).toFixed(2)}B`;
      if (d >= 1e6) return `$${(d / 1e6).toFixed(2)}M`;
      return `$${d}`;
    };

    // Bars with animation
    svg
      .selectAll('rect')
      .data(marketCaps, (d: any) => d.ticker)
      .join(
        (enter) =>
          enter
            .append('rect')
            .attr('x', (d) => x(d.ticker)!)
            .attr('y', y(0))
            .attr('width', x.bandwidth())
            .attr('height', 0)
            .attr('fill', (d) => color(d.ticker)!)
            .on('mouseover', (event, d) => {
              tooltip.transition().duration(200).style('opacity', 0.9);
              tooltip
                .html(`${d.ticker}: ${formatMarketCap(d.marketCap)}`)
                .style('left', event.pageX + 10 + 'px')
                .style('top', event.pageY - 28 + 'px');
            })
            .on('mouseout', () =>
              tooltip.transition().duration(200).style('opacity', 0)
            )
            .call((enter) =>
              enter
                .transition()
                .duration(800)
                .attr('y', (d) => y(d.marketCap))
                .attr('height', (d) => height - margin.bottom - y(d.marketCap))
            ),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(800)
              .attr('x', (d) => x(d.ticker)!)
              .attr('y', (d) => y(d.marketCap))
              .attr('width', x.bandwidth())
              .attr('height', (d) => height - margin.bottom - y(d.marketCap))
          )
      );

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(y)
          .tickFormat((domainValue, _index) =>
            formatMarketCap(Number(domainValue))
          )
      );

    // Axis labels
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height - 10)
      .attr('text-anchor', 'middle')
      .text('Selected Tickers');

    svg
      .append('text')
      .attr('x', -height / 2)
      .attr('y', 20)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Market Cap ($)');
  }, [marketCaps]);

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

      {/* Selected Tickers */}
      {selectedTickers.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-2 text-lg font-medium">Selected tickers:</h3>
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
        </div>
      )}

      {/* Chart */}
      <div className="mt-10">
        <h3 className="mb-4 text-center text-lg font-semibold text-white">
          Market Capitalization Comparison
        </h3>
        <svg ref={chartRef}></svg>
      </div>
    </div>
  );
};
