import { useEffect, useState } from 'react';
import { ChartingNavbar } from '../../components/navbar/ChartingNavbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CompanyInfo {
  price: string;
  beta: string;
  symbol: string;
  marketCap: number;
  lastDividend: number;
  range: string;
  change: number;
  changePercentage: number;
  volume: number;
  averageVolume: number;
  companyName: string;
  currency: string;
  exchange: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  ipoDate: string;
  image: string;
  city: string;
  state: string;
  address: string;
}

const formatNumber = (num: number | string | null | undefined, digits = 2) => {
  if (num === null || num === undefined) return '-';
  if (typeof num === 'string') num = parseFloat(num);
  if (isNaN(num)) return '-';
  if (num >= 1e12) return (num / 1e12).toFixed(digits) + 'T';
  if (num >= 1e9)  return (num / 1e9).toFixed(digits)  + 'B';
  if (num >= 1e6)  return (num / 1e6).toFixed(digits)  + 'M';
  if (num >= 1e3)  return (num / 1e3).toFixed(digits)  + 'K';
  return num.toLocaleString();
};

const StatCard = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm">
    <div className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-white/35">{label}</div>
    <div className="text-base font-bold text-white">{value}</div>
  </div>
);

export default function TickerInfoPage() {
  const [data, setData]           = useState<CompanyInfo | null>(null);
  const [query, setQuery]         = useState('TSLA');
  const [inputValue, setInputValue] = useState('TSLA');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE_URL}/stocks/${query}/companyInfo`)
      .then((res) => res.json())
      .then((d) => {
        if (!d || !d.symbol || !d.companyName || d.price === undefined) {
          setError('This ticker is not available. Please try another one.');
          setData(null);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('This ticker is not available. Please try another one.');
        setData(null);
        setLoading(false);
      });
  }, [query]);

  useEffect(() => {
    setImageError(false);
  }, [data?.image]);

  const isPositive = (data?.change ?? 0) >= 0;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#06050f] text-white">

      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-52 -left-52 h-[600px] w-[600px] rounded-full bg-purple-700/10 blur-[130px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-indigo-700/8 blur-[110px]" />
      </div>

      <ChartingNavbar />

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Stock Ticker</h1>
          <p className="mt-1 text-sm text-white/40">Search for real-time company information</p>
        </div>

        {/* Search bar */}
        <div className="mb-8 flex items-center gap-3">
          <input
            className="flex-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-3 text-sm text-white placeholder-white/25 backdrop-blur-sm outline-none transition focus:border-purple-500/40 focus:bg-white/[0.05]"
            placeholder="Enter ticker symbol (e.g. AAPL)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') setQuery(inputValue.toUpperCase()); }}
          />
          <button
            className="cursor-pointer rounded-2xl border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-semibold text-purple-300 backdrop-blur-sm transition hover:border-purple-500/50 hover:bg-purple-500/20 hover:text-white"
            onClick={() => setQuery(inputValue.toUpperCase())}
          >
            Search
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-white/40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-purple-500" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-8 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : data ? (
          <div className="flex flex-col gap-5">

            {/* Hero card */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                {/* Left: logo + name */}
                <div className="flex items-center gap-4">
                  {imageError || !data.image ? (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/[0.08] text-sm font-bold text-white/60">
                      {data.symbol.slice(0, 2)}
                    </div>
                  ) : (
                    <img
                      src={data.image}
                      alt={data.symbol}
                      className="h-14 w-14 shrink-0 rounded-2xl bg-white object-contain p-1.5"
                      onError={() => setImageError(true)}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl font-extrabold">{data.symbol}</span>
                      <span className="text-base text-white/55">{data.companyName}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">{data.exchange}</span>
                      <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">{data.sector}</span>
                      <span className="rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-fuchsia-300">{data.industry}</span>
                    </div>
                  </div>
                </div>

                {/* Right: price */}
                <div className="text-right">
                  <div className="text-4xl font-extrabold tracking-tight">${data.price}</div>
                  <div className={`mt-1 text-sm font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)} ({data.changePercentage.toFixed(2)}%)
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/30">{data.currency}</div>
                </div>
              </div>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard label="Market Cap"  value={data.marketCap  != null ? `$${formatNumber(data.marketCap)}`  : '-'} />
              <StatCard label="Volume"      value={data.volume     != null ? formatNumber(data.volume)           : '-'} />
              <StatCard label="Avg Volume"  value={data.averageVolume != null ? formatNumber(data.averageVolume) : '-'} />
              <StatCard label="52W Range"   value={data.range || '-'} />
              <StatCard label="Beta"        value={data.beta       ?? '-'} />
              <StatCard label="Last Dividend" value={data.lastDividend != null ? `$${formatNumber(data.lastDividend)}` : '-'} />
              <StatCard label="IPO Date"    value={data.ipoDate    || '-'} />
              <StatCard label="Employees"   value={data.fullTimeEmployees ? formatNumber(data.fullTimeEmployees) : '-'} />
            </div>

            {/* Description */}
            {data.description && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">About</div>
                <p className="text-sm leading-relaxed text-white/60">{data.description}</p>
              </div>
            )}

            {/* Bottom row: CEO / Website / HQ */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" fill="#a855f7" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] text-white/35">CEO</div>
                  <div className="text-sm font-semibold text-white">{data.ceo || '-'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" stroke="#a855f7" strokeWidth="2" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-white/35">Website</div>
                  {data.website ? (
                    <a
                      href={data.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-sm font-semibold text-purple-400 hover:text-purple-300"
                    >
                      {data.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-white">-</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-sm">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" fill="#a855f7" />
                  </svg>
                </div>
                <div>
                  <div className="text-[11px] text-white/35">Headquarters</div>
                  <div className="text-sm font-semibold text-white">
                    {data.city || data.state
                      ? `${data.city || ''}${data.city && data.state ? ', ' : ''}${data.state || ''}`
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : null}
      </main>
    </div>
  );
}
