import { useState, useEffect } from 'react';
import { FaTrash, FaRegEdit } from 'react-icons/fa';
import Chart from './RenderChart';
import VerticalNavbar from '../../components/navbar/VerticalNavbar';
import WelcomeDashboard from './welcome-modal/WelcomeDashboard';
import SelectDashboardType from './welcome-modal/SelectDashboardType';

type ChartData = {
  title: string;
  chartType: string;
  selectedStocks: string[];
  startDate: string;
  endDate: string;
  primaryMetric: string;
  secondaryMetric: string;
};

const PRIMARY_METRICS = [
  'Price To Sales Ratio',
  'Price To Earnings Ratio',
  'Market Cap',
  'Dividend Yield (%)',
  'Earnings Per Share',
];
const SECONDARY_METRICS = [
  'None',
  'Price To Sales Ratio',
  'Price To Earnings Ratio',
  'Market Cap',
  'Dividend Yield (%)',
  'Earnings Per Share',
];
const CHART_TYPE = ['Bar Chart', 'Line Chart'];

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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ ticker: string; name: string }[]>(
    []
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const resetForm = () => {
    setTitle('');
    setChartType(CHART_TYPE[0]);
    setSelectedStocks([]);
    setPrimaryMetric(PRIMARY_METRICS[0]);
    setSecondaryMetric(SECONDARY_METRICS[0]);
    setQuery('');
    setResults([]);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      chartType,
      selectedStocks,
      startDate,
      endDate,
      primaryMetric,
      secondaryMetric,
    });
    onClose();
    resetForm();
  };

  if (!open) return null;

  return (
    // this is the div for the entire page when the add chart modal is open
    <div className="fixed inset-0 z-50 flex items-center justify-center border border-white bg-black/60">
      {/* this is the actual modal box */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white bg-[#181425] p-8 shadow-2xl">
        {/* this is the close button */}
        <button
          className="absolute top-4 right-4 cursor-pointer text-xl text-purple-200 hover:text-fuchsia-400"
          onClick={() => {
            resetForm();
            onClose();
          }}
        >
          ×
        </button>
        <h2 className="mb-1 text-xl font-semibold text-white">Add New Chart</h2>
        <div className="mb-6 text-sm text-purple-200">
          Configure your financial chart by selecting stocks and metrics
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Chart Title Input */}
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

          {/* Chart Type Input */}
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

          {/* Select Stocks Input */}
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

          {/* Y-Axis Metric (Primary) */}
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

          {/* Start Date */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              Start Date
            </label>
            <input
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          {/* End Date */}
          <div>
            <label className="mb-1 block text-xs text-purple-200">
              End Date
            </label>
            <input
              className="w-full rounded-md border border-fuchsia-700/40 bg-[#231133] p-3 text-white placeholder-purple-400 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Cancel and Submit Buttons */}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-[#231133] px-6 py-2 font-semibold text-white transition hover:bg-[#2d1840]"
              onClick={() => {
                resetForm();
                onClose();
              }}
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
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [selectTypeOpen, setSelectTypeOpen] = useState(false);

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
    <div className="font-inter bg-fuchisa flex min-h-screen text-white">
      <VerticalNavbar />
      <div className="flex-1">
        <WelcomeDashboard
          open={welcomeOpen}
          onClose={() => {
            setWelcomeOpen(false);
            setSelectTypeOpen(true);
          }}
        />
        <SelectDashboardType
          open={selectTypeOpen}
          onSelect={(type) => {
            setSelectTypeOpen(false);
            // *****IMPORTANT*****
            // handle type selection here later
          }}
        />
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
                    <div className="mb-2 flex h-200 items-center justify-center rounded-lg bg-[#16131f]">
                      <span className="text-purple-400">
                        <Chart
                          tickers={chart.selectedStocks}
                          metric={chart.primaryMetric}
                          startDate={chart.startDate}
                          endDate={chart.endDate}
                          chartType={chart.chartType}
                        />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className="flex h-64 cursor-pointer items-center justify-center rounded-2xl border-2 border-[#28243a] bg-[#181425] transition hover:border-fuchsia-700/40"
                    onClick={() => setModalOpen(true)}
                  >
                    <span className="text-lg text-purple-300">+ Add Chart</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
