import { useState } from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LineChart from './chart-types/LineChart';
import BarChart from './chart-types/BarChart';

const METRICS = [
  {
    label: 'Earnings Per Share',
    value: 'Earnings Per Share',
    sub: 'Profit per share',
  },
  {
    label: 'Price To Earnings Ratio',
    value: 'Price To Earnings Ratio',
    sub: 'Valuation vs. earnings',
  },
  {
    label: 'Price To Sales Ratio',
    value: 'Price To Sales Ratio',
    sub: 'Company valuation vs. revenue',
  },
  { label: 'Revenues', value: 'Revenues', sub: 'Total company revenue' },
  { label: 'Net Income', value: 'Net Income', sub: 'Total company profit' },
];
const CHART_TYPES = ['Bar Chart', 'Line Chart'];

interface CustomChart {
  title: string;
  ticker: string;
  metric: string;
  chartType: string;
  startDate: string;
  endDate: string;
}

export default function CustomChartsPage() {
  const [showModal, setShowModal] = useState(true);
  const [title, setTitle] = useState('');
  const [ticker, setTicker] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(METRICS[0].value);
  const [selectedChartType, setSelectedChartType] = useState(CHART_TYPES[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [customCharts, setCustomCharts] = useState<CustomChart[]>([]);

  const handleAddChart = () => {
    setCustomCharts((prevCharts) => {
      const newCharts = [
        ...prevCharts,
        {
          title,
          ticker,
          metric: selectedMetric,
          chartType: selectedChartType,
          startDate,
          endDate,
        },
      ];
      // Automatically switch to the new tab
      setActiveTab(newCharts.length - 1);
      return newCharts;
    });
    setShowModal(false);
    setTitle('');
    setTicker('');
    setStartDate('');
    setEndDate('');
  };

  // Chart rendering logic for each custom chart
  const renderChart = (chart: CustomChart, idx: number) => {
    const { ticker, metric, chartType, startDate, endDate } = chart;
    if (!ticker || !metric || !chartType) return null;
    // Use array index to guarantee uniqueness
    const chartKey = `chart-${idx}`;
    if (chartType === 'Line Chart') {
      return (
        <LineChart
          key={chartKey}
          tickers={[ticker]}
          metric={metric}
          startDate={startDate}
          endDate={endDate}
          containerWidth="100%"
          containerHeight="100%"
        />
      );
    } else if (chartType === 'Bar Chart') {
      return (
        <BarChart
          key={chartKey}
          tickers={[ticker]}
          metric={metric}
          startDate={startDate}
          endDate={endDate}
          containerWidth="100%"
          containerHeight="100%"
        />
      );
    }
    return null;
  };

  // Tab state for custom charts
  const [activeTab, setActiveTab] = useState(0);

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
        <main
          className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-2 pb-8"
          style={{ minHeight: '100vh', overflowY: 'auto' }}
        >
          <div className="mb-6 flex w-full items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-extrabold text-white">
                Custom Charts
              </h1>
              <div className="text-lg text-slate-300">
                Build your personalized analytics dashboard
              </div>
            </div>
            <button
              className="flex items-center gap-2 rounded-lg bg-[#8B5CF6] px-5 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#672eeb]"
              onClick={() => setShowModal(true)}
            >
              <FaPlus /> Add Chart
            </button>
          </div>
          {/* Modal for creating custom chart */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="relative w-full max-w-2xl rounded-2xl border border-[#8B5CF6] bg-[#181a2a] p-10 shadow-2xl">
                <button
                  className="absolute top-4 right-4 text-xl text-purple-200 hover:text-fuchsia-400"
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </button>
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-full bg-[#8B5CF6] p-2">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                      <rect width="24" height="24" rx="8" fill="#8B5CF6" />
                      <path
                        d="M12 7v5l3 3"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span className="text-2xl font-bold text-white">
                    Create Custom Chart
                  </span>
                </div>
                <form className="flex flex-col gap-6">
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Chart Title
                    </label>
                    <input
                      className="w-full rounded-md border border-[#8B5CF6] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#8B5CF6] focus:outline-none"
                      placeholder="e.g., Apple Revenue Analysis"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Stock Ticker
                    </label>
                    <input
                      className="w-full rounded-md border border-[#8B5CF6] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#8B5CF6] focus:outline-none"
                      placeholder="Search ticker (e.g., AAPL)"
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Metric
                    </label>
                    <div className="mb-2 flex gap-3">
                      {METRICS.map((m) => (
                        <button
                          key={m.value}
                          type="button"
                          className={`flex min-h-[80px] w-44 max-w-[180px] flex-col items-start justify-between rounded-xl border px-4 py-3 text-left font-bold break-words whitespace-normal text-white transition ${
                            selectedMetric === m.value
                              ? 'border-[#8B5CF6] bg-[#2d1e4a]'
                              : 'border-[#23203a]/60 bg-[#23203a] hover:bg-[#2d1e4a]/80'
                          }`}
                          onClick={() => setSelectedMetric(m.value)}
                        >
                          <span className="text-base font-bold break-words whitespace-normal">
                            {m.label}
                          </span>
                          <span className="mt-1 text-xs leading-tight font-normal break-words whitespace-normal text-purple-200">
                            {m.sub}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      Chart Type
                    </label>
                    <div className="mb-2 flex gap-2">
                      {CHART_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
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
                    <label className="mb-1 block text-xs text-purple-200">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-[#8B5CF6] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#8B5CF6] focus:outline-none"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-purple-200">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-md border border-[#8B5CF6] bg-[#23203a] p-3 text-white placeholder-purple-200 focus:ring-1 focus:ring-[#8B5CF6] focus:outline-none"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg bg-[#231133] px-6 py-2 font-semibold text-white transition hover:bg-[#2d1840]"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer rounded-lg bg-[#8B5CF6] px-6 py-2 font-semibold text-white transition hover:bg-[#672eeb]"
                      onClick={handleAddChart}
                    >
                      + Add Chart
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Custom charts dashboard placeholder */}
          <div className="mt-4 flex w-full flex-col items-center justify-center">
            {customCharts.length === 0 ? (
              <div className="text-lg text-slate-400">
                No custom charts yet. Add your first chart!
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  {customCharts.map((chart, idx) => (
                    <button
                      key={idx}
                      className={`rounded-t-lg border-b-2 px-6 py-2 font-semibold transition ${
                        activeTab === idx
                          ? 'border-[#8B5CF6] bg-[#8B5CF6] text-white'
                          : 'border-transparent bg-[#23203a] text-slate-300 hover:bg-[#2d1e4a]/80'
                      }`}
                      onClick={() => setActiveTab(idx)}
                    >
                      {chart.title || chart.ticker || `Chart ${idx + 1}`}
                    </button>
                  ))}
                </div>
                <div className="flex w-full flex-col items-center">
                  <div
                    className="flex w-full flex-col items-center rounded-2xl border border-[#8B5CF6] bg-[#181a2a] p-10 shadow-2xl"
                    style={{
                      maxWidth: 1100,
                      minWidth: 400,
                      minHeight: 500,
                      height: '55vh',
                    }}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <div className="flex w-full flex-1 items-center justify-center">
                        <div
                          className="h-full w-full"
                          style={{ minHeight: 320 }}
                        >
                          {renderChart(customCharts[activeTab], activeTab)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
