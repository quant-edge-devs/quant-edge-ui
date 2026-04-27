import { Link } from 'react-router';
import { useEffect, useState } from 'react';

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
  if (num >= 1e9) return (num / 1e9).toFixed(digits) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(digits) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(digits) + 'K';
  return num.toLocaleString();
};

export default function TickerInfoPage() {
  const [data, setData] = useState<CompanyInfo | null>(null);
  const [query, setQuery] = useState('TSLA');
  const [inputValue, setInputValue] = useState('TSLA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE_URL}/stocks/${query}/companyInfo`)
      .then((res) => res.json())
      .then((d) => {
        // Defensive: check for required fields
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

  // Reset imageError when data changes
  useEffect(() => {
    setImageError(false);
  }, [data?.image]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-[radial-gradient(ellipse_at_center,_#1E1B4B_30%,_#0F172A_100%)] px-2 py-6">
      {/* Top-left logo and name */}
      <div className="absolute top-0 left-0 z-10 flex items-center gap-3 px-12 py-6">
        <Link to="/" className="group flex items-center gap-4">
          <span className="cursor-pointer rounded-xl bg-[#672eeb] p-2">
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
          <span className="ml-2 cursor-pointer text-3xl font-bold text-white">
            QuantEdge
          </span>
        </Link>
      </div>
      <div className="animate-float-in mx-auto w-full max-w-3xl">
        {/* Header */}
        <h1 className="mt-2 mb-1 flex items-center gap-2 text-3xl font-extrabold text-white">
          <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
            <rect
              width="32"
              height="32"
              rx="12"
              fill="#fff"
              fillOpacity="0.12"
            />
            <path
              d="M10 22V12M16 22V16M22 22V10"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Stock Ticker
        </h1>
        <div className="mb-6 text-lg text-purple-100">
          Search for real-time stock information
        </div>
        {/* Search Bar */}
        <div className="mb-8 flex w-full items-center rounded-xl bg-white/10 px-4 py-2 shadow-lg">
          <svg
            className="mr-2 text-purple-200"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 20 20"
          >
            <circle cx="9" cy="9" r="7" stroke="#a78bfa" strokeWidth="2" />
            <path
              d="M15 15l-3-3"
              stroke="#a78bfa"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            className="flex-1 bg-transparent text-lg text-white placeholder-purple-200 outline-none"
            placeholder="Enter ticker symbol (e.g. AAPL)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setQuery(inputValue.toUpperCase());
            }}
            style={{ minWidth: 0 }}
          />
          <button
            className="ml-4 cursor-pointer rounded-lg bg-white/80 px-6 py-2 text-lg font-semibold text-[#7c3aed] transition hover:bg-white"
            onClick={() => setQuery(inputValue.toUpperCase())}
          >
            Search
          </button>
        </div>
        {/* Main Card */}
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl">
          {loading ? (
            <div className="py-12 text-center text-lg text-purple-200">
              Loading...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-lg text-pink-400">
              {error}
            </div>
          ) : data ? (
            <>
              {/* Top Row */}
              <div className="mb-6 flex flex-col items-center gap-6 md:flex-row md:items-start">
                {imageError || !data.image ? (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/80 shadow"
                    style={{ background: 'white' }}
                  >
                    <span className="text-xl font-bold text-gray-500">
                      {data.symbol}
                    </span>
                  </div>
                ) : (
                  <img
                    src={data.image}
                    alt={data.symbol}
                    className="h-16 w-16 rounded-xl bg-white/80 object-contain p-2 shadow"
                    style={{ background: 'white' }}
                    onError={() => setImageError(true)}
                  />
                )}
                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold text-white">
                        {data.symbol}
                      </span>
                      <span className="text-lg font-semibold text-white/80">
                        {data.companyName}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <span className="rounded bg-[#a78bfa]/30 px-2 py-1 text-xs font-semibold text-[#a78bfa]">
                        {data.exchange}
                      </span>
                      <span className="rounded bg-[#818cf8]/30 px-2 py-1 text-xs font-semibold text-[#818cf8]">
                        {data.sector}
                      </span>
                      <span className="rounded bg-[#f472b6]/30 px-2 py-1 text-xs font-semibold text-[#f472b6]">
                        {data.industry}
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto flex flex-col items-end">
                    <div className="text-4xl font-extrabold text-white">
                      ${data.price}
                    </div>
                    <div
                      className={`text-lg font-semibold ${data.change < 0 ? 'text-pink-400' : 'text-green-400'}`}
                    >
                      {data.change < 0 ? '▼' : '▲'} {data.change} (
                      {data.changePercentage.toFixed(2)}%)
                    </div>
                    <div className="mt-1 text-xs text-purple-200">
                      {data.currency}
                    </div>
                  </div>
                </div>
              </div>
              {/* Stat Grid */}
              <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">MARKET CAP</div>
                  <div className="text-lg font-bold text-white">
                    {data.marketCap !== null && data.marketCap !== undefined
                      ? `$${formatNumber(data.marketCap)}`
                      : '-'}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">VOLUME</div>
                  <div className="text-lg font-bold text-white">
                    {data.volume !== null && data.volume !== undefined
                      ? formatNumber(data.volume)
                      : '-'}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">AVG VOLUME</div>
                  <div className="text-lg font-bold text-white">
                    {data.averageVolume !== null &&
                    data.averageVolume !== undefined
                      ? formatNumber(data.averageVolume)
                      : '-'}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">52W RANGE</div>
                  <div className="text-lg font-bold text-white">
                    {data.range ? data.range : '-'}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">BETA</div>
                  <div className="text-lg font-bold text-white">
                    {data.beta !== null && data.beta !== undefined
                      ? data.beta
                      : '-'}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">
                    LAST DIVIDEND
                  </div>
                  <div className="text-lg font-bold text-white">
                    {data.lastDividend !== null &&
                    data.lastDividend !== undefined
                      ? `$${formatNumber(data.lastDividend)}`
                      : '-'}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">IPO DATE</div>
                  <div className="text-lg font-bold text-white">
                    {data.ipoDate ? data.ipoDate : '-'}
                  </div>
                </div>
                <div className="min-w-0 rounded-xl bg-white/10 p-4 text-center">
                  <div className="mb-1 text-xs text-purple-200">EMPLOYEES</div>
                  <div className="text-lg font-bold text-white">
                    {data.fullTimeEmployees !== null &&
                    data.fullTimeEmployees !== undefined &&
                    data.fullTimeEmployees !== ''
                      ? formatNumber(data.fullTimeEmployees)
                      : '-'}
                  </div>
                </div>
              </div>
              {/* About */}
              <div className="mb-6 rounded-xl bg-white/10 p-4">
                <div className="mb-1 text-xs text-purple-200">ABOUT</div>
                <div className="text-sm leading-relaxed text-white">
                  {data.description ? data.description : '-'}
                </div>
              </div>
              {/* Bottom Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 p-4">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M10 2v2m6.364 1.636l-1.414 1.414M18 10h-2m-1.636 6.364l-1.414-1.414M10 18v-2M3.636 16.364l1.414-1.414M2 10h2M3.636 3.636l1.414 1.414"
                      stroke="#a78bfa"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-purple-200">CEO</div>
                    <div className="font-semibold text-white">
                      {data.ceo ? data.ceo : '-'}
                    </div>
                  </div>
                </div>
                <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white/10 p-4">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="#a78bfa"
                      strokeWidth="2"
                    />
                    <path
                      d="M7 10l2 2 4-4"
                      stroke="#a78bfa"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="min-w-0">
                    <div className="text-xs text-purple-200">Website</div>
                    {data.website ? (
                      <a
                        href={data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold break-all text-white underline hover:text-fuchsia-400"
                      >
                        {data.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="font-semibold text-white">-</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-white/10 p-4">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <path
                      d="M10 2C5.58 2 2 5.58 2 10c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8zm0 14a6 6 0 100-12 6 6 0 000 12zm0-9a3 3 0 110 6 3 3 0 010-6z"
                      fill="#a78bfa"
                    />
                  </svg>
                  <div>
                    <div className="text-xs text-purple-200">Headquarters</div>
                    <div className="font-semibold text-white">
                      {data.city || data.state
                        ? `${data.city || ''}${data.city && data.state ? ', ' : ''}${data.state || ''}, US`
                        : '-'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
