import { useState, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import { ChartingNavbar } from '../../components/navbar/ChartingNavbar';
import { getDateRange } from './getDateRange';
import HeatmapChart from './chart-types/HeatmapChart';

import { API_BASE_URL } from '../../config';

const TIMEFRAMES = ['1Y', '3Y', '5Y', '10Y'] as const;

const btnBase = 'rounded-lg px-4 py-2 text-sm font-medium transition';
const btnActive = 'bg-purple-600 text-white shadow shadow-purple-900/30';
const btnInactive =
  'border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.03] dark:bg-white/[0.03] text-gray-500 dark:text-white/60 hover:border-purple-500/30 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] hover:text-gray-900 dark:hover:text-white';
const inputCls =
  'w-full rounded-xl border border-black/[0.10] dark:border-white/[0.08] bg-black/[0.04] dark:bg-white/[0.04] px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 transition focus:border-purple-500/50 focus:bg-black/[0.06] dark:focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-purple-500/30';

type PricePoint = { date: string; value: number };

async function fetchPriceHistory(
  ticker: string,
  startDate: string,
  endDate: string
): Promise<PricePoint[]> {
  const raw = await (
    await fetch(
      `${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/priceHistory`
    )
  ).json();
  if (!Array.isArray(raw)) return [];
  return raw
    .map((d: any) => ({ date: d.date as string, value: d.price as number }))
    .filter((p) => p.value != null && p.value > 0);
}

function computeReturns(points: PricePoint[]): Map<string, number> {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const returns = new Map<string, number>();
  for (let i = 1; i < sorted.length; i++) {
    returns.set(
      sorted[i].date,
      Math.log(sorted[i].value / sorted[i - 1].value)
    );
  }
  return returns;
}

function pearson(x: number[], y: number[]): number {
  const n = x.length;
  if (n < 2) return NaN;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  let num = 0,
    dx2 = 0,
    dy2 = 0;
  for (let i = 0; i < n; i++) {
    const ex = x[i] - mx;
    const ey = y[i] - my;
    num += ex * ey;
    dx2 += ex * ex;
    dy2 += ey * ey;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 1 : num / denom;
}

function buildMatrix(returnsMaps: Map<string, number>[]): number[][] {
  const sets = returnsMaps.map((m) => new Set(m.keys()));
  const commonDates = [...sets[0]]
    .filter((d) => sets.every((s) => s.has(d)))
    .sort();
  const n = returnsMaps.length;
  const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
        continue;
      }
      const xi = commonDates.map((d) => returnsMaps[i].get(d)!);
      const xj = commonDates.map((d) => returnsMaps[j].get(d)!);
      const r = Math.max(-1, Math.min(1, pearson(xi, xj)));
      matrix[i][j] = r;
      matrix[j][i] = r;
    }
  }
  return matrix;
}

export const CorrelationPage = () => {
  const [tickerInput, setTickerInput] = useState('');
  const [tickers, setTickers] = useState<string[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1Y');
  const [matrix, setMatrix] = useState<number[][] | null>(null);
  const [computedTickers, setComputedTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startDate, endDate } = getDateRange(selectedTimeframe);

  const addTicker = () => {
    const t = tickerInput.trim().toUpperCase();
    if (t && !tickers.includes(t)) setTickers((prev) => [...prev, t]);
    setTickerInput('');
  };

  const removeTicker = (t: string) =>
    setTickers((prev) => prev.filter((tk) => tk !== t));

  const compute = useCallback(async () => {
    if (tickers.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const allPoints = await Promise.all(
        tickers.map((t) => fetchPriceHistory(t, startDate, endDate))
      );
      const returnsMaps = allPoints.map(computeReturns);
      setMatrix(buildMatrix(returnsMaps));
      setComputedTickers([...tickers]);
    } catch {
      setError('Failed to fetch data. Check your tickers and try again.');
    } finally {
      setLoading(false);
    }
  }, [tickers, startDate, endDate]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ff] dark:bg-[#06050f] text-gray-900 dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <ChartingNavbar activeMode="correlation" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Correlation Heatmap
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
            Measure daily price return correlations across a basket of stocks.
            Purple = correlated, red = inversely correlated.
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Stock Tickers{' '}
                <span className="normal-case font-normal tracking-normal text-gray-300 dark:text-white/25">
                  (add at least 2)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  className={inputCls}
                  placeholder="Add ticker (e.g. AAPL) and press Enter"
                  value={tickerInput}
                  onChange={(e) => setTickerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTicker();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTicker}
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                >
                  Add
                </button>
              </div>
              {tickers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tickers.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 rounded-lg bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/20"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => removeTicker(t)}
                        className="text-purple-500/60 dark:text-purple-400/60 transition hover:text-red-500 dark:hover:text-red-400"
                      >
                        <FaTimes className="text-[10px]" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                  Time Period
                </label>
                <div className="flex gap-2">
                  {TIMEFRAMES.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`${btnBase} ${selectedTimeframe === tf ? btnActive : btnInactive}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={compute}
                disabled={tickers.length < 2 || loading}
                className="rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Computing…' : 'Compute Correlations'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!matrix && !loading && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] py-24 text-center backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
                <rect x="3"  y="3"  width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.85" />
                <rect x="10" y="3"  width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.45" />
                <rect x="17" y="3"  width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.45" />
                <rect x="3"  y="10" width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.45" />
                <rect x="10" y="10" width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.85" />
                <rect x="17" y="10" width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.25" />
                <rect x="3"  y="17" width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.45" />
                <rect x="10" y="17" width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.25" />
                <rect x="17" y="17" width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.85" />
              </svg>
            </div>
            <div>
              <div className="text-base font-semibold text-gray-500 dark:text-white/60">
                Add tickers to get started
              </div>
              <div className="mt-1 text-sm text-gray-400 dark:text-white/30">
                Add at least 2 tickers, choose a time period, and click Compute
                Correlations
              </div>
            </div>
          </div>
        )}

        {/* Heatmap */}
        {matrix && computedTickers.length >= 2 && (
          <>
            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/35">
              {computedTickers.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-purple-500/15 px-2 py-0.5 font-semibold text-purple-600 dark:text-purple-300 ring-1 ring-purple-500/20"
                >
                  {t}
                </span>
              ))}
              <span className="text-gray-300 dark:text-white/20">·</span>
              <span>
                {selectedTimeframe} · daily price returns
              </span>
            </div>

            <div className="relative min-h-[520px] flex-1 rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] backdrop-blur-sm">
              <div className="absolute inset-0 p-6">
                <HeatmapChart
                  tickers={computedTickers}
                  matrix={matrix}
                  containerWidth="100%"
                  containerHeight="100%"
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};
