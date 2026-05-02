import { useState, useMemo } from 'react';
import LineChart from './chart-types/LineChart';
import BarChart from './chart-types/BarChart';
import { getDateRange } from './getDateRange';
import { ChartingNavbar } from '../../components/navbar/ChartingNavbar';

const METRICS = [
  { label: 'Price To Sales Ratio',   sub: 'Valuation vs. revenue'         },
  { label: 'Price To Earnings Ratio', sub: 'Valuation vs. earnings'        },
  { label: 'Market Cap',              sub: 'Total company value'            },
  { label: 'Dividend Yield (%)',      sub: 'Annual dividend as % of price'  },
  { label: 'Earnings Per Share',      sub: 'Profit per share'               },
  { label: 'Revenues',               sub: 'Total company revenue'          },
  { label: 'Net Income',             sub: 'Total company profit'           },
];

const CHART_TYPES = ['Bar Chart', 'Line Chart'] as const;
const TIMEFRAMES  = ['1Y', '3Y', '5Y', '10Y'] as const;

export const PresetChartsPage = () => {
  const [tickerInput, setTickerInput]   = useState('');
  const [ticker, setTicker]             = useState('');
  const [selectedMetric, setSelectedMetric]         = useState(METRICS[0].label);
  const [selectedChartType, setSelectedChartType]   = useState<string>(CHART_TYPES[0]);
  const [selectedTimeframe, setSelectedTimeframe]   = useState<string>(TIMEFRAMES[0]);
  const [loading, setLoading] = useState(false);

  const { startDate, endDate } = getDateRange(selectedTimeframe);
  const tickers = useMemo(() => (ticker ? [ticker] : []), [ticker]);
  const aggregateByYear = selectedTimeframe !== '1Y';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tickerInput.trim().toUpperCase();
    if (t) setTicker(t);
  };

  const activeMetric = METRICS.find((m) => m.label === selectedMetric);

  const chartArea = useMemo(() => {
    if (!ticker) return null;
    const shared = {
      tickers,
      metric: selectedMetric,
      startDate,
      endDate,
      setLoading,
      interval: aggregateByYear ? ('annual' as const) : ('quarter' as const),
    };
    if (selectedChartType === 'Line Chart') return <LineChart {...shared} />;
    return <BarChart {...shared} />;
  }, [ticker, selectedMetric, selectedChartType, startDate, endDate, aggregateByYear, tickers]);

  return (
    <div className="flex min-h-screen flex-col bg-[#06050f] text-white">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <ChartingNavbar activeMode="preset" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Preset Charts</h1>
          <p className="mt-1 text-sm text-white/45">
            Search any public ticker, pick a metric and time period, and visualize instantly.
          </p>
        </div>

        {/* Controls card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm">

          {/* Row 1: Ticker search */}
          <form onSubmit={handleSearch} className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/40">
              Stock Ticker
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/25 transition focus:border-purple-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                placeholder="e.g. AAPL, TSLA, MSFT"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
              />
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500"
              >
                Search
              </button>
            </div>
            {ticker && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
                Showing:
                <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-300 ring-1 ring-purple-500/20">
                  {ticker}
                </span>
                <button
                  type="button"
                  className="text-white/30 transition hover:text-white/60"
                  onClick={() => { setTicker(''); setTickerInput(''); }}
                >
                  ✕ clear
                </button>
              </div>
            )}
          </form>

          {/* Row 2: Metric selection */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/40">
              Metric
            </label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMetric(m.label)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedMetric === m.label
                      ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                      : 'border border-white/[0.07] bg-white/[0.03] text-white/60 hover:border-purple-500/30 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {activeMetric && (
              <p className="mt-2 text-xs text-white/35">{activeMetric.sub}</p>
            )}
          </div>

          {/* Row 3: Chart type + Timeframe */}
          <div className="flex flex-wrap items-start gap-8">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/40">
                Chart Type
              </label>
              <div className="flex gap-2">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedChartType(type)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      selectedChartType === type
                        ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                        : 'border border-white/[0.07] bg-white/[0.03] text-white/60 hover:border-purple-500/30 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/40">
                Time Period
              </label>
              <div className="flex gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      selectedTimeframe === tf
                        ? 'bg-purple-600 text-white shadow shadow-purple-900/30'
                        : 'border border-white/[0.07] bg-white/[0.03] text-white/60 hover:border-purple-500/30 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chart area */}
        <div className="relative min-h-[520px] flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#06050f]/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
                <span className="text-sm text-white/50">Loading chart…</span>
              </div>
            </div>
          )}

          {!ticker ? (
            <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <path d="M7 17V9M12 17V13M17 17V7" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-white/60">Enter a ticker to get started</div>
                <div className="mt-1 text-sm text-white/30">Search for any publicly traded company above</div>
              </div>
            </div>
          ) : (
            <div
              className={`absolute inset-0 p-4 transition-opacity ${
                loading ? 'pointer-events-none opacity-0' : 'opacity-100'
              }`}
            >
              {chartArea}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
