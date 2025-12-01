import { useState, useEffect } from 'react';
import { FaShareAlt, FaDownload, FaTrash, FaRegEdit } from 'react-icons/fa';

type ChartData = {
  title: string;
  chartType: string;
  selectedStocks: string[];
  primaryMetric: string;
  secondaryMetric: string;
};

const PRIMARY_METRICS = [
  'Revenue ($M)',
  'Net Income ($M)',
  'Gross Margin (%)',
  'Operating Margin (%)',
  'Growth Rate (%)',
  'EPS ($)',
  'Market Cap ($B)',
];
const SECONDARY_METRICS = [
  'None',
  'Revenue ($M)',
  'Net Income ($M)',
  'Gross Margin (%)',
  'Operating Margin (%)',
  'Growth Rate (%)',
  'EPS ($)',
  'Market Cap ($B)',
];
const CHART_TYPE = [
  'Bar Chart',
  'Line Chart',
  'Area Chart',
  'Scatter Plot',
  'Bubble Chart',
  'Pie Chart',
];

function AddChartModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (data: ChartData) => void;
}) {
  const [title, setTitle] = useState('');
  const [chartType, setChartType] = useState(CHART_TYPE[0]);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [primaryMetric, setPrimaryMetric] = useState(PRIMARY_METRICS[0]);
  const [secondaryMetric, setSecondaryMetric] = useState(SECONDARY_METRICS[0]);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ ticker: string; name: string }[]>(
    []
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch tickers as user types
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
      } catch (error) {
        setResults([]);
      }
    };
    const delayDebounce = setTimeout(fetchTickers, 200);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (ticker: string) => {
    if (!selectedStocks.includes(ticker)) {
      setSelectedStocks([...selectedStocks, ticker]);
    }
    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  const handleRemove = (ticker: string) => {
    setSelectedStocks(selectedStocks.filter((t) => t !== ticker));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      chartType,
      selectedStocks,
      primaryMetric,
      secondaryMetric,
    });
    onClose();
    // Reset form
    setTitle('');
    setChartType(CHART_TYPE[0]);
    setSelectedStocks([]);
    setPrimaryMetric(PRIMARY_METRICS[0]);
    setSecondaryMetric(SECONDARY_METRICS[0]);
    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-lg rounded-2xl border border-fuchsia-700/40 bg-[#181425] p-8 shadow-2xl">
        <button
          className="absolute top-4 right-4 cursor-pointer text-xl text-purple-200 hover:text-fuchsia-400"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="mb-1 text-xl font-semibold text-white">Add New Chart</h2>
        <div className="mb-6 text-sm text-purple-200">
          Configure your financial chart by selecting stocks and metrics
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Chart Title
            </label>
            <input
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              placeholder="Enter chart title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Chart Type
            </label>
            <select
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white focus:outline-none"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              {CHART_TYPE.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Select Stocks
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                placeholder="Search for stock tickers..."
                className="w-full rounded border border-gray-300 bg-[#231133] px-4 py-2 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              />
              {isDropdownOpen && results.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                  {results.map((item, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelect(item.ticker)}
                      className="flex cursor-pointer justify-between p-2 hover:bg-blue-50"
                    >
                      <span className="font-medium text-black">
                        {item.ticker}
                      </span>
                      <span className="text-sm text-black">{item.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Selected tickers */}
            {selectedStocks.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedStocks.map((ticker, i) => (
                  <div
                    key={i}
                    className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                  >
                    {ticker}
                    <button
                      onClick={() => handleRemove(ticker)}
                      className="ml-2 font-bold text-blue-500 hover:text-red-600"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Y-Axis Metric (Primary)
            </label>
            <select
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white focus:outline-none"
              value={primaryMetric}
              onChange={(e) => setPrimaryMetric(e.target.value)}
            >
              {PRIMARY_METRICS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Y-Axis Metric (Secondary - Optional)
            </label>
            <select
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white focus:outline-none"
              value={secondaryMetric}
              onChange={(e) => setSecondaryMetric(e.target.value)}
            >
              {SECONDARY_METRICS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-[#231133] px-6 py-2 font-semibold text-white transition hover:bg-[#2d1840]"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-fuchsia-600 px-6 py-2 font-semibold text-white transition hover:bg-fuchsia-700"
            >
              Add Chart
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export const Charting = () => {
  const [charts, setCharts] = useState<(ChartData | null)[]>([null]);
  const [modalOpen, setModalOpen] = useState(false);

  // Add a new chart to the first empty slot
  const handleAddChart = (chart: ChartData) => {
    const idx = charts.findIndex((c) => c === null);
    if (idx !== -1) {
      const updated: (ChartData | null)[] = [...charts];
      updated[idx] = chart;
      // If all slots are now filled, add a new empty slot
      if (updated.every((c) => c !== null)) {
        (updated as (ChartData | null)[]).push(null);
      }
      setCharts(updated);
    }
  };

  // Remove a chart and keep at least one empty slot
  const handleRemoveChart = (idx: number) => {
    const updated = [...charts];
    updated[idx] = null;
    // Remove trailing empty slots, but keep at least one
    while (
      updated.length > 1 &&
      updated[updated.length - 1] === null &&
      updated[updated.length - 2] === null
    ) {
      updated.pop();
    }
    setCharts(updated);
  };

  return (
    <div className="font-inter min-h-screen bg-[#16131f] text-white">
      {/* ...header and other content... */}
      <AddChartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={handleAddChart}
      />
      <div className="flex gap-8 px-8 py-8">
        <div className="flex-1">
          <div className="mb-2 text-xl font-semibold">Your Dashboard</div>
          <div className="mb-6 text-sm text-purple-200">
            Create and customize financial visualizations
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-6">
            {charts.map((chart, idx) =>
              chart ? (
                <div
                  key={idx}
                  className="relative rounded-2xl border-2 border-fuchsia-700/40 bg-[#181425] p-4 shadow-lg"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      {chart.title}
                    </span>
                    <div className="flex gap-2">
                      <button className="text-purple-300 hover:text-fuchsia-400">
                        <FaRegEdit />
                      </button>
                      <button
                        className="text-purple-300 hover:text-red-400"
                        onClick={() => handleRemoveChart(idx)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  {/* Chart placeholder */}
                  <div className="mb-2 flex h-48 items-center justify-center rounded-lg bg-[#16131f]">
                    <span className="text-purple-400">[Chart Here]</span>
                  </div>
                </div>
              ) : (
                <div
                  key={idx}
                  className="flex h-64 cursor-pointer items-center justify-center rounded-2xl border-2 border-[#28243a] bg-[#181425] transition hover:border-fuchsia-700/40"
                  onClick={() => setModalOpen(true)}
                >
                  <span className="text-lg text-purple-300">
                    +<br />
                    Add Chart
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
