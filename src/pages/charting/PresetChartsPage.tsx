import { useState, useMemo, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import LineChart from './chart-types/LineChart';
import BarChart from './chart-types/BarChart';
import BubbleChart from './chart-types/BubbleChart';
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
  { label: 'EV / EBITDA',            sub: 'Enterprise value vs. operating earnings' },
  { label: 'Price to Book',          sub: 'Market price vs. book value'    },
  { label: 'Debt to Equity',         sub: 'Financial leverage ratio'       },
  { label: 'Return on Equity',       sub: 'Net income vs. shareholder equity' },
  { label: 'Return on Assets',       sub: 'Net income vs. total assets'    },
];

const CHART_TYPES = ['Bar Chart', 'Area Chart', 'Line Chart', 'Bubble Chart'] as const;
const TIMEFRAMES  = ['1Y', '3Y', '5Y', '10Y'] as const;

const btnBase = 'rounded-lg px-4 py-2 text-sm font-medium transition';
const btnActive = 'bg-purple-600 text-white shadow shadow-purple-900/30';
const btnInactive = 'border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.03] dark:bg-white/[0.03] text-gray-500 dark:text-white/60 hover:border-purple-500/30 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] hover:text-gray-900 dark:hover:text-white';

export const PresetChartsPage = () => {
  const [tickerInput, setTickerInput]   = useState('');
  const [ticker, setTicker]             = useState('');
  const [bubbleTickers, setBubbleTickers] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric]         = useState(METRICS[0].label);
  const [selectedYMetric, setSelectedYMetric]       = useState(METRICS[1].label);
  const [selectedSizeMetric, setSelectedSizeMetric] = useState<string>('None');
  const [selectedChartType, setSelectedChartType]   = useState<string>(CHART_TYPES[0]);
  const [selectedTimeframe, setSelectedTimeframe]   = useState<string>(TIMEFRAMES[0]);
  const [loading, setLoading] = useState(false);

  const { startDate, endDate } = getDateRange(selectedTimeframe);
  const isBubble = selectedChartType === 'Bubble Chart';
  const singleTickers = useMemo(() => (ticker ? [ticker] : []), [ticker]);
  const effectiveTickers = isBubble ? bubbleTickers : singleTickers;
  const aggregateByYear = selectedTimeframe !== '1Y';

  // Reset bubble-specific state when switching away from Bubble Chart
  useEffect(() => {
    if (!isBubble) {
      setBubbleTickers([]);
      setSelectedSizeMetric('None');
    }
  }, [isBubble]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tickerInput.trim().toUpperCase();
    if (t) setTicker(t);
  };

  const handleAddBubbleTicker = () => {
    const t = tickerInput.trim().toUpperCase();
    if (t && !bubbleTickers.includes(t)) setBubbleTickers((prev) => [...prev, t]);
    setTickerInput('');
  };

  const activeMetric = METRICS.find((m) => m.label === selectedMetric);

  const chartArea = useMemo(() => {
    if (isBubble) {
      if (!bubbleTickers.length || !selectedMetric || !selectedYMetric) return null;
      return (
        <BubbleChart
          tickers={bubbleTickers}
          xMetric={selectedMetric}
          yMetric={selectedYMetric}
          sizeMetric={selectedSizeMetric !== 'None' ? selectedSizeMetric : undefined}
          startDate={startDate}
          endDate={endDate}
          setLoading={setLoading}
          interval={aggregateByYear ? 'annual' : 'quarter'}
          containerWidth="100%"
          containerHeight="100%"
        />
      );
    }
    if (!ticker) return null;
    const shared = {
      tickers: singleTickers,
      metric: selectedMetric,
      startDate,
      endDate,
      setLoading,
      interval: aggregateByYear ? ('annual' as const) : ('quarter' as const),
    };
    if (selectedChartType === 'Area Chart') return <LineChart {...shared} showArea />;
    if (selectedChartType === 'Line Chart') return <LineChart {...shared} />;
    return <BarChart {...shared} />;
  }, [
    isBubble, bubbleTickers, ticker, singleTickers,
    selectedMetric, selectedYMetric, selectedSizeMetric,
    selectedChartType, startDate, endDate, aggregateByYear,
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ff] dark:bg-[#06050f] text-gray-900 dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <ChartingNavbar activeMode="preset" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Preset Charts</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
            Search any public ticker, pick a metric and time period, and visualize instantly.
          </p>
        </div>

        <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-6 backdrop-blur-sm">
          {!isBubble ? (
            <form onSubmit={handleSearch} className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Stock Ticker
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.04] dark:bg-white/[0.04] px-4 py-2.5 text-sm placeholder-gray-400 dark:placeholder-white/25 transition focus:border-purple-500/50 focus:bg-black/[0.06] dark:focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-purple-500/30"
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
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400 dark:text-white/40">
                  Showing:
                  <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/20">
                    {ticker}
                  </span>
                  <button
                    type="button"
                    className="text-gray-400 dark:text-white/30 transition hover:text-gray-600 dark:hover:text-white/60"
                    onClick={() => { setTicker(''); setTickerInput(''); }}
                  >
                    ✕ clear
                  </button>
                </div>
              )}
            </form>
          ) : (
            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Stock Tickers
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.04] dark:bg-white/[0.04] px-4 py-2.5 text-sm placeholder-gray-400 dark:placeholder-white/25 transition focus:border-purple-500/50 focus:bg-black/[0.06] dark:focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                  placeholder="Add ticker (e.g. AAPL) and press Enter"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBubbleTicker(); } }}
                />
                <button
                  type="button"
                  onClick={handleAddBubbleTicker}
                  className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500"
                >
                  Add
                </button>
              </div>
              {bubbleTickers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {bubbleTickers.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/20"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => setBubbleTickers((prev) => prev.filter((tk) => tk !== t))}
                        className="text-purple-500/60 dark:text-purple-400/60 transition hover:text-red-500 dark:hover:text-red-400"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
              {isBubble ? 'X Axis Metric' : 'Metric'}
            </label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSelectedMetric(m.label)}
                  className={`${btnBase} ${selectedMetric === m.label ? btnActive : btnInactive}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {activeMetric && (
              <p className="mt-2 text-xs text-gray-400 dark:text-white/35">{activeMetric.sub}</p>
            )}
          </div>

          {isBubble && (
            <>
              <div className="mb-6">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Y Axis Metric
                </label>
                <div className="flex flex-wrap gap-2">
                  {METRICS.filter((m) => m.label !== selectedMetric).map((m) => (
                    <button
                      key={m.label}
                      onClick={() => setSelectedYMetric(m.label)}
                      className={`${btnBase} ${selectedYMetric === m.label ? btnActive : btnInactive}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Bubble Size <span className="normal-case tracking-normal font-normal text-gray-300 dark:text-white/25">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSizeMetric('None')}
                    className={`${btnBase} ${selectedSizeMetric === 'None' ? btnActive : btnInactive}`}
                  >
                    None
                  </button>
                  {METRICS.filter(
                    (m) => m.label !== selectedMetric && m.label !== selectedYMetric
                  ).map((m) => (
                    <button
                      key={m.label}
                      onClick={() => setSelectedSizeMetric(m.label)}
                      className={`${btnBase} ${selectedSizeMetric === m.label ? btnActive : btnInactive}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex flex-wrap items-start gap-8">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Chart Type
              </label>
              <div className="flex gap-2">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedChartType(type)}
                    className={`${btnBase} font-semibold ${selectedChartType === type ? btnActive : btnInactive}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Time Period
              </label>
              <div className="flex gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`${btnBase} font-semibold ${selectedTimeframe === tf ? btnActive : btnInactive}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="relative min-h-[520px] flex-1 rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] backdrop-blur-sm">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#f5f3ff]/60 dark:bg-[#06050f]/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
                <span className="text-sm text-gray-500 dark:text-white/50">Loading chart…</span>
              </div>
            </div>
          )}

          {!effectiveTickers.length ? (
            <div className="flex h-full min-h-[520px] flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                  <path d="M7 17V9M12 17V13M17 17V7" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="text-base font-semibold text-gray-500 dark:text-white/60">
                  {isBubble ? 'Add tickers to get started' : 'Enter a ticker to get started'}
                </div>
                <div className="mt-1 text-sm text-gray-400 dark:text-white/30">
                  {isBubble
                    ? 'Add at least two tickers above to compare them visually'
                    : 'Search for any publicly traded company above'}
                </div>
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
