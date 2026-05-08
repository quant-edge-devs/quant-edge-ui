import { useState, useEffect } from 'react';
import { ChartingNavbar } from '../../components/navbar/ChartingNavbar';
import { getDateRange } from './getDateRange';
import { FaTimes } from 'react-icons/fa';

import { API_BASE_URL } from '../../config';

const TIMEFRAMES = ['1Y', '3Y', '5Y', '10Y'] as const;
const FILTERS = ['All', 'Purchases', 'Sales', 'Other'] as const;

type Filter = (typeof FILTERS)[number];

interface InsiderTransaction {
  symbol: string;
  transactionDate: string;
  reportingName: string;
  transactionType: string;
  securitiesTransacted: number;
  price: number;
  typeOfOwner: string;
  acquisitionOrDisposition?: string;
}

function txLabel(type: string): string {
  if (type === 'P-Purchase') return 'Purchase';
  if (type === 'S-Sale') return 'Sale';
  if (type === 'A-Award') return 'Award';
  if (type === 'M-Exempt') return 'M-Exempt';
  if (type === 'F-InKind') return 'F-InKind';
  return type;
}

function isBuy(tx: InsiderTransaction): boolean {
  if (tx.acquisitionOrDisposition) return tx.acquisitionOrDisposition === 'A';
  return tx.transactionType === 'P-Purchase';
}

function isSell(tx: InsiderTransaction): boolean {
  if (tx.acquisitionOrDisposition) return tx.acquisitionOrDisposition === 'D';
  return tx.transactionType === 'S-Sale';
}

function txColor(tx: InsiderTransaction) {
  if (isBuy(tx)) return 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25';
  if (isSell(tx)) return 'bg-red-500/15 text-red-400 ring-1 ring-red-500/25';
  return 'bg-white/[0.06] text-white/45 ring-1 ring-white/[0.08]';
}

function matchesFilter(tx: InsiderTransaction, filter: Filter): boolean {
  if (filter === 'All') return true;
  if (filter === 'Purchases') return isBuy(tx);
  if (filter === 'Sales') return isSell(tx);
  return !isBuy(tx) && !isSell(tx);
}

function formatNum(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

const btnBase = 'rounded-lg px-4 py-2 text-sm font-medium transition';
const btnActive = 'bg-purple-600 text-white shadow shadow-purple-900/30';
const btnInactive =
  'border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.03] dark:bg-white/[0.03] text-gray-500 dark:text-white/60 hover:border-purple-500/30 hover:bg-black/[0.06] dark:hover:bg-white/[0.07] hover:text-gray-900 dark:hover:text-white';

export const InsiderTradingPage = () => {
  const [tickerInput, setTickerInput] = useState('');
  const [ticker, setTicker] = useState('');
  const [timeframe, setTimeframe] = useState<string>('1Y');
  const [filter, setFilter] = useState<Filter>('All');
  const [data, setData] = useState<InsiderTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { startDate, endDate } = getDateRange(timeframe);

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    setError(false);
    fetch(`${API_BASE_URL}/stocks/${ticker}/${startDate}/${endDate}/insiderTrading`)
      .then((r) => r.json())
      .then((raw) => {
        setData(Array.isArray(raw) ? raw : []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [ticker, startDate, endDate]);

  const filtered = data.filter((t) => matchesFilter(t, filter));

  const totalBuyShares = data
    .filter(isBuy)
    .reduce((s, t) => s + t.securitiesTransacted, 0);
  const totalSellShares = data
    .filter(isSell)
    .reduce((s, t) => s + t.securitiesTransacted, 0);
  const uniqueInsiders = new Set(data.map((t) => t.reportingName)).size;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const t = tickerInput.trim().toUpperCase();
    if (t) { setTicker(t); setData([]); }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3ff] dark:bg-[#06050f] text-gray-900 dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-700/15 blur-[140px]" />
        <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <ChartingNavbar activeMode="insider" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Insider Trading</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-white/45">
            Track SEC-reported insider transactions for any public company.
          </p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-6 backdrop-blur-sm">
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
                  onClick={() => { setTicker(''); setTickerInput(''); setData([]); }}
                >
                  <FaTimes className="text-[10px]" /> clear
                </button>
              </div>
            )}
          </form>

          <div className="flex flex-wrap items-start gap-8">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Time Period
              </label>
              <div className="flex gap-2">
                {TIMEFRAMES.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`${btnBase} font-semibold ${timeframe === tf ? btnActive : btnInactive}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Transaction Type
              </label>
              <div className="flex gap-2">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`${btnBase} font-semibold ${filter === f ? btnActive : btnInactive}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        {ticker && !loading && data.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-500/70">
                Shares Bought
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">
                {formatNum(totalBuyShares)}
              </p>
              <p className="mt-0.5 text-xs text-emerald-500/50">Open market purchases</p>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-400/70">
                Shares Sold
              </p>
              <p className="mt-1 text-2xl font-extrabold text-red-400">
                {formatNum(totalSellShares)}
              </p>
              <p className="mt-0.5 text-xs text-red-500/50">Open market sales</p>
            </div>
            <div className="rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/40">
                Unique Insiders
              </p>
              <p className="mt-1 text-2xl font-extrabold">{uniqueInsiders}</p>
              <p className="mt-0.5 text-xs text-gray-400 dark:text-white/30">
                Reporting individuals
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="relative flex-1 rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f5f3ff]/60 dark:bg-[#06050f]/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
                <span className="text-sm text-gray-500 dark:text-white/50">Loading transactions…</span>
              </div>
            </div>
          )}

          {!ticker && !loading && (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M12 3a9 9 0 100 18A9 9 0 0012 3z" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-500 dark:text-white/60">Enter a ticker to get started</p>
                <p className="mt-1 text-sm text-gray-400 dark:text-white/30">Search any public company to see insider activity</p>
              </div>
            </div>
          )}

          {ticker && !loading && error && (
            <div className="flex h-64 items-center justify-center text-sm text-red-400">
              Failed to load data. Check the ticker and try again.
            </div>
          )}

          {ticker && !loading && !error && filtered.length === 0 && data.length > 0 && (
            <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-white/40">
              No {filter.toLowerCase()} transactions found in this period.
            </div>
          )}

          {ticker && !loading && !error && data.length === 0 && (
            <div className="flex h-64 items-center justify-center text-sm text-gray-400 dark:text-white/40">
              No insider transactions found for {ticker} in this period.
            </div>
          )}

          {filtered.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.06]">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/35">Date</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/35">Insider</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/35">Role</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/35">Type</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/35">Shares</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-white/35">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => (
                    <tr
                      key={i}
                      className="border-b border-black/[0.04] dark:border-white/[0.04] transition hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-white/45 whitespace-nowrap">
                        {tx.transactionDate}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-800 dark:text-white/85 whitespace-nowrap">
                        {tx.reportingName}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-white/40 max-w-[200px] truncate">
                        {tx.typeOfOwner}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${txColor(tx)}`}>
                          {txLabel(tx.transactionType)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm tabular-nums">
                        {formatNum(tx.securitiesTransacted)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm tabular-nums text-gray-500 dark:text-white/50">
                        {tx.price > 0 ? `$${tx.price.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
