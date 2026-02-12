import { useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

// Charting controls config
const METRICS = [
  {
    label: 'Price To Sales Ratio',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#8B5CF6" />
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
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#8B5CF6" />
        <circle cx="10" cy="10" r="5" stroke="#fff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    label: 'Market Cap',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#8B5CF6" />
        <rect x="5" y="10" width="10" height="5" rx="2" fill="#fff" />
      </svg>
    ),
  },
  {
    label: 'Dividend Yield (%)',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#8B5CF6" />
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
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#8B5CF6" />
        <rect x="7" y="7" width="6" height="6" rx="2" fill="#fff" />
      </svg>
    ),
  },
  {
    label: 'Revenues',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#8B5CF6" />
        <rect x="5" y="12" width="10" height="3" rx="1.5" fill="#fff" />
      </svg>
    ),
  },
  {
    label: 'Net Income',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
        <rect width="20" height="20" rx="6" fill="#8B5CF6" />
        <rect x="5" y="5" width="10" height="10" rx="3" fill="#fff" />
      </svg>
    ),
  },
];

const CHART_TYPES = ['Bar Chart', 'Line Chart'];
const TIMEFRAMES = ['1Y', '3Y', '5Y', '10Y'];

// Main charting page (unified design)
export const Charting = () => {
  const [ticker, setTicker] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].label);
  const [selectedChartType, setSelectedChartType] = useState(CHART_TYPES[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[0]);
  const navigate = useNavigate();

  return (
    <div className="font-inter flex h-screen overflow-hidden bg-[radial-gradient(ellipse_at_center,_#1E1B4B_30%,_#0F172A_100%)] text-white">
      <div className="flex h-screen flex-1 flex-col">
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
              className="text-lg font-medium text-white transition hover:text-[#8B5CF6]"
            >
              Feedback
            </Link>
            <Link to="#" className="text-lg text-white">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 2v2m6.364 1.636l-1.414 1.414M22 12h-2M19.364 19.364l-1.414-1.414M12 22v-2M4.636 19.364l1.414-1.414M2 12h2M4.636 4.636l1.414 1.414"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
              className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-5 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#672eeb]"
              onClick={() => navigate('/charting/custom')}
            >
              <FaPlus /> Add Custom Chart
            </button>
          </div>
          {/* Card/Panel */}
          <div className="mb-10 rounded-2xl border border-[#23203a]/60 bg-[#181a2a] p-10 shadow-lg">
            {/* Ticker Search */}
            <div className="mb-6">
              <label className="mb-2 block text-lg font-semibold text-white">
                Stock Ticker
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-[#23203a]/60 bg-[#23203a] py-3 pr-4 pl-12 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
                  placeholder="Search ticker (e.g., AAPL)"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                />
                <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-[#8B5CF6]" />
              </div>
            </div>
            {/* Metric Selection */}
            <div className="mb-6">
              <label className="mb-2 block text-lg font-semibold text-white">
                Select Metric
              </label>
              <div className="flex flex-wrap gap-4">
                {METRICS.map((m) => (
                  <button
                    key={m.label}
                    className={`flex h-28 w-56 flex-col items-start gap-2 rounded-xl border px-6 py-4 text-left break-words whitespace-normal transition ${
                      selectedMetric === m.label
                        ? 'border-[#8B5CF6] bg-[#2d1e4a]'
                        : 'border-[#23203a]/60 bg-[#23203a] hover:bg-[#2d1e4a]/80'
                    }`}
                    onClick={() => setSelectedMetric(m.label)}
                  >
                    <span className="mb-1 flex items-center gap-2 text-lg font-bold break-words whitespace-normal text-white">
                      {m.icon} {m.label}
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
                          ? 'bg-[#8B5CF6] text-white'
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
                          ? 'bg-[#8B5CF6] text-white'
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
          <div className="flex min-h-[300px] w-full flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#8B5CF6]/40 bg-[#181a2a] p-12">
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
                      fill="#8B5CF6"
                    />
                    <rect
                      x="18"
                      y="8"
                      width="6"
                      height="6"
                      rx="2"
                      fill="#8B5CF6"
                    />
                    <rect
                      x="8"
                      y="18"
                      width="6"
                      height="6"
                      rx="2"
                      fill="#8B5CF6"
                    />
                    <rect
                      x="18"
                      y="18"
                      width="6"
                      height="6"
                      rx="2"
                      fill="#8B5CF6"
                    />
                  </g>
                </svg>
                <span className="text-lg text-[#8B5CF6]">
                  Enter a ticker above to see the chart
                </span>
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center">
                {/* Chart rendering would go here */}
                <span className="text-[#8B5CF6]">
                  [Chart for {ticker} - {selectedMetric} - {selectedChartType} -{' '}
                  {selectedTimeframe}]
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
