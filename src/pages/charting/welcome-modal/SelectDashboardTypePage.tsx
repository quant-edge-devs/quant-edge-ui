import { useNavigate } from 'react-router';
import { ChartingNavbar } from '../../../components/navbar/ChartingNavbar';

export default function SelectDashboardTypePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#f5f3ff] dark:bg-[#06050f] text-gray-900 dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-purple-700/20 blur-[140px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[130px]" />
      </div>

      <ChartingNavbar />

      <main className="relative flex min-h-[calc(100vh-57px)] flex-col items-center justify-center px-6 py-16">
        <div className="animate-fade-up mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-300">Choose your mode</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            How do you want to explore?
          </h1>
          <p className="mt-4 text-lg text-gray-500 dark:text-white/50">
            Start with preset views or build a fully custom dashboard
          </p>
        </div>

        <div className="animate-fade-up-delay grid w-full max-w-4xl gap-5 md:grid-cols-3">
          <button
            onClick={() => navigate('/charting/preset')}
            className="group flex flex-col rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-8 text-left backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-950/20 dark:hover:shadow-purple-950/30"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20 transition group-hover:bg-purple-500/20">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <path d="M7 17V9M12 17V13M17 17V7" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold">Preset Charts</div>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-white/50">
              Instant financial views. Search any ticker, pick a metric, and choose from our fixed time periods — no setup needed.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-purple-500 dark:text-purple-400 transition group-hover:gap-2">
              Explore presets <span>→</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/charting/correlation')}
            className="group flex flex-col rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-8 text-left backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:shadow-2xl hover:shadow-purple-950/20 dark:hover:shadow-purple-950/30"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20 transition group-hover:bg-purple-500/20">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="3"  y="3"  width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.9" />
                <rect x="10" y="3"  width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.45" />
                <rect x="17" y="3"  width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.45" />
                <rect x="3"  y="10" width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.45" />
                <rect x="10" y="10" width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.9" />
                <rect x="17" y="10" width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.25" />
                <rect x="3"  y="17" width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.45" />
                <rect x="10" y="17" width="4" height="4" rx="1" fill="#ef4444" fillOpacity="0.25" />
                <rect x="17" y="17" width="4" height="4" rx="1" fill="#A855F7" fillOpacity="0.9" />
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold">Correlation</div>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-white/50">
              Visualize how stocks move together. Compare a basket of tickers and see which are correlated, inversely correlated, or independent.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-purple-500 dark:text-purple-400 transition group-hover:gap-2">
              Explore correlations <span>→</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/charting/custom')}
            className="group flex flex-col rounded-2xl border border-purple-500/25 bg-purple-600/8 p-8 text-left backdrop-blur-sm transition-all duration-300 hover:border-purple-500/45 hover:bg-purple-600/15 hover:shadow-2xl hover:shadow-purple-950/20 dark:hover:shadow-purple-950/30"
          >
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20 ring-1 ring-purple-500/30 transition group-hover:bg-purple-600/30">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                <rect x="3"  y="3"  width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                <rect x="14" y="3"  width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                <rect x="3"  y="14" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold">Custom Charts</div>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-white/50">
              Build a personal dashboard. Compare multiple tickers, pick any metric and date range, then save charts to your account.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-purple-500 dark:text-purple-400 transition group-hover:gap-2">
              Build a dashboard <span>→</span>
            </div>
          </button>
        </div>

        <p className="animate-fade-up-delay mt-10 text-xs text-gray-300 dark:text-white/25">
          Custom charts require an account to save and sync across devices
        </p>
      </main>
    </div>
  );
}
