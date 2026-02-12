import { Link, useNavigate } from 'react-router-dom';

export default function SelectDashboardTypePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1E1B4B_30%,_#0F172A_100%)]">
      {/* Navbar */}
      <header className="flex items-center justify-between px-12 py-6">
        <div className="flex items-center gap-4">
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
          <span className="ml-2 text-3xl font-bold text-white">QuantEdge</span>
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
      <main className="flex flex-col items-center justify-center px-4 pt-16 pb-16">
        <h1 className="mb-4 text-center text-4xl font-extrabold text-white md:text-5xl">
          Build Your Analytics
        </h1>
        <div className="mb-8 text-center text-lg text-slate-300">
          Choose how you want to start exploring financial data
        </div>
        <div className="grid w-full max-w-3xl gap-8 md:grid-cols-2">
          {/* Preset Charts Card */}
          <button
            className="group cursor-pointer rounded-2xl border border-[#23203a]/60 bg-[#181a2a] p-8 shadow-lg transition hover:bg-[#23203a] hover:shadow-xl focus:outline-none"
            onClick={() => navigate('/charting/preset')}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#672eeb]/20">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="12" fill="#8B5CF6" />
                <g>
                  <rect x="8" y="8" width="6" height="6" rx="2" fill="#fff" />
                  <rect x="18" y="8" width="6" height="6" rx="2" fill="#fff" />
                  <rect x="8" y="18" width="6" height="6" rx="2" fill="#fff" />
                  <rect x="18" y="18" width="6" height="6" rx="2" fill="#fff" />
                </g>
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold text-white">
              Preset Charts
            </div>
            <div className="text-md text-slate-300">
              Quick access to common financial metrics. Just enter a ticker and
              choose your visualization.
            </div>
          </button>
          {/* Custom Charts Card */}
          <button
            className="group cursor-pointer rounded-2xl border border-[#23203a]/60 bg-[#672eeb] p-8 shadow-lg transition hover:bg-[#7c4dff] hover:shadow-xl focus:outline-none"
            onClick={() => navigate('/charting/custom')}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#8B5CF6]/20">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="12" fill="#8B5CF6" />
                <path
                  d="M16 8l4 4-4 4-4-4 4-4zm0 8v8"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold text-white">
              Custom Charts
            </div>
            <div className="text-md text-slate-300">
              Build personalized charts with custom titles, metrics, and
              timeframes for your research.
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
