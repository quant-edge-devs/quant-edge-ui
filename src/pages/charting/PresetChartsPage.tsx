import { useState, useMemo } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import LineChart from './chart-types/LineChart';
import BarChart from './chart-types/BarChart';
import { getDateRange } from './getDateRange';

// Charting controls config
const METRICS = [
  {
    label: 'Price To Sales Ratio',
    sub: 'Company valuation vs. revenue',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#672eeb" />
        <path
          d="M6 14V8M10 14V11M14 14V6"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Price To Earnings Ratio',
    sub: 'Valuation vs. earnings',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#672eeb" />
        <circle cx="10" cy="10" r="5" stroke="#fff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Market Cap',
    sub: 'Total company value',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#672eeb" />
        <rect x="5" y="10" width="10" height="5" rx="2" fill="#fff" />
      </svg>
    ),
  },
  {
    label: 'Dividend Yield (%)',
    sub: 'Annual dividend as % of price',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#672eeb" />
        <path
          d="M10 5v10M5 10h10"
          stroke="#fff"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Earnings Per Share',
    sub: 'Profit per share',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#672eeb" />
        <rect x="7" y="7" width="6" height="6" rx="2" fill="#fff" />
      </svg>
    ),
  },
  {
    label: 'Revenues',
    sub: 'Total company revenue',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#672eeb" />
        <rect x="5" y="12" width="10" height="3" rx="1.5" fill="#fff" />
      </svg>
    ),
  },
  {
    label: 'Net Income',
    sub: 'Total company profit',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#672eeb" />
        <rect x="5" y="5" width="10" height="10" rx="3" fill="#fff" />
      </svg>
    ),
  },
];

const CHART_TYPES = ['Bar Chart', 'Line Chart'];
const TIMEFRAMES = ['1Y', '3Y', '5Y', '10Y'];

// Main charting page (unified design)
export const PresetChartsPage = () => {
  const [tickerInput, setTickerInput] = useState('');
  const [ticker, setTicker] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].label);
  const [selectedChartType, setSelectedChartType] = useState(CHART_TYPES[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Map timeframe to date range
  const { startDate, endDate } = getDateRange(selectedTimeframe);
  const metric = selectedMetric;

  // Memoize tickers array to avoid unnecessary re-renders
  const tickers = useMemo(() => (ticker ? [ticker] : []), [ticker]);

  // Chart rendering logic
  let chartArea = null;
  if (ticker) {
    if (selectedChartType === 'Line Chart') {
      chartArea = (
        <LineChart
          tickers={tickers}
          metric={metric}
          startDate={startDate}
          endDate={endDate}
          setLoading={setLoading}
        />
      );
    } else if (selectedChartType === 'Bar Chart') {
      chartArea = (
        <BarChart
          tickers={tickers}
          metric={metric}
          startDate={startDate}
          endDate={endDate}
          setLoading={setLoading}
        />
      );
    }
  }

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTicker(tickerInput.trim().toUpperCase());
  };

  return (
    <div className="font-inter flex min-h-screen bg-[radial-gradient(ellipse_at_center,_#1E1B4B_30%,_#0F172A_100%)] text-white">
      <div className="flex flex-1 flex-col">
        {/* Navbar */}
        <header className="flex items-center justify-between px-12 py-6">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <span className="rounded-xl bg-[#672eeb] p-2">
                <svg width="40" height="40" fill="none" viewBox="0 0 32 32">
                  <rect width="32" height="32" rx="12" fill="#672eeb" />
                  <path
                    d="M10 22V12M16 22V16M22 22V10"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="ml-2 text-3xl font-bold text-white">
                QuantEdge
              </span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              to="/contact-us"
              className="text-lg font-medium text-white transition hover:text-[#672eeb]"
            >
              Feedback
            </Link>
          </nav>
        </header>
        {/* Main content */}
        <main className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-8 pb-16">
          <div className="mb-8 flex w-full items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold text-white">
                Preset Charts
              </h1>
              <div className="text-lg text-slate-300">
                Search a ticker and configure your visualization
              </div>
            </div>
            <button
              className="flex items-center gap-2 rounded-lg bg-[#672eeb] px-5 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#672eeb]"
              onClick={() => navigate('/charting/custom')}
            >
              <FaPlus /> Add Custom Chart
            </button>
          </div>
          {/* Card/Panel */}
          <div className="mb-10 rounded-2xl border border-[#23203a]/60 bg-[#181a2a] p-10 shadow-lg">
            {/* Ticker Search */}
            <form className="mb-6" onSubmit={handleSearch}>
              <label className="mb-2 block text-lg font-semibold text-white">
                Stock Ticker
              </label>
              <div className="relative flex gap-2">
                <input
                  className="w-full rounded-lg border border-[#23203a]/60 bg-[#23203a] py-3 pr-4 pl-12 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#672eeb] focus:outline-none"
                  placeholder="Search ticker (e.g., AAPL)"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-2 rounded-lg bg-[#672eeb] px-4 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#672eeb]"
                >
                  <FaSearch /> Search
                </button>
                <FaSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#672eeb]" />
              </div>
            </form>
            {/* Metric Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-lg font-semibold text-white">
                Select Metric
              </label>
              <div className="flex flex-wrap gap-4">
                {METRICS.map((m) => (
                  <button
                    key={m.label}
                    className={`flex max-w-xs min-w-[200px] flex-col items-start gap-2 rounded-xl border px-6 py-4 text-left break-words whitespace-normal transition ${
                      selectedMetric === m.label
                        ? 'border-[#672eeb] bg-[#2d1e4a]'
                        : 'border-[#23203a]/60 bg-[#23203a] hover:bg-[#2d1e4a]/80'
                    }`}
                    onClick={() => setSelectedMetric(m.label)}
                  >
                    <span className="mb-1 flex items-center gap-2 text-lg font-bold break-words whitespace-normal text-white">
                      {m.icon} {m.label}
                    </span>
                    <span className="text-xs leading-tight break-words whitespace-normal text-purple-200">
                      {m.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {/* Chart Type & Timeframe */}
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="mb-2 text-lg font-semibold text-white">
                  Chart Type
                </div>
                <div className="flex gap-2">
                  {CHART_TYPES.map((type) => (
                    <button
                      key={type}
                      className={`rounded-lg px-6 py-2 font-semibold transition ${
                        selectedChartType === type
                          ? 'bg-[#672eeb] text-white'
                          : 'bg-[#23203a] text-slate-300 hover:bg-[#2d1e4a]/80'
                      }`}
                      onClick={() => setSelectedChartType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-lg font-semibold text-white">
                  Timeframe
                </div>
                <div className="flex gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      className={`rounded-lg px-6 py-2 font-semibold transition ${
                        selectedTimeframe === tf
                          ? 'bg-[#672eeb] text-white'
                          : 'bg-[#23203a] text-slate-300 hover:bg-[#2d1e4a]/80'
                      }`}
                      onClick={() => setSelectedTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Chart Area */}
          <div className="relative flex min-h-[800px] w-full flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#672eeb]/40 bg-[#181a2a] p-4">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40">
                <div className="animate-pulse rounded-lg border border-[#23203a]/60 bg-[#181a2a] px-8 py-6 text-xl font-semibold text-white shadow-lg">
                  Loading chart...
                </div>
              </div>
            )}
            {!ticker ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <svg width="48" height="48" fill="none" viewBox="0 0 32 32">
                  <rect width="32" height="32" rx="12" fill="#23203a" />
                  <g>
                    <rect
                      x="8"
                      y="8"
                      width="6"
                      height="6"
                      rx="2"
                      fill="#672eeb"
                    />
                    <rect
                      x="18"
                      y="8"
                      width="6"
                      height="6"
                      rx="2"
                      fill="#672eeb"
                    />
                    <rect
                      x="8"
                      y="18"
                      width="6"
                      height="6"
                      rx="2"
                      fill="#672eeb"
                    />
                    <rect
                      x="18"
                      y="18"
                      width="6"
                      height="6"
                      rx="2"
                      fill="#672eeb"
                    />
                  </g>
                </svg>
                <span className="text-lg text-[#672eeb]">
                  Enter a ticker above to see the chart
                </span>
              </div>
            ) : (
              <div
                className={`relative flex h-full w-full flex-col items-center justify-center${
                  loading ? 'pointer-events-none opacity-0' : ''
                }`}
              >
                {chartArea}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
