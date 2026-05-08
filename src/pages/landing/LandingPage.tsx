import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserAvatar from '../../components/navbar/UserAvatar';
import { Logo } from '../../components/Logo';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useEffect, useRef, useState } from 'react';

function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

const revealClass = (visible: boolean) =>
  `transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

export const Landing = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  const statsReveal = useScrollReveal();
  const featuresReveal = useScrollReveal();
  const howReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f3ff] dark:bg-[#06050f] text-gray-900 dark:text-white">
      {/* ── Ambient background orbs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-orb absolute -top-52 -left-52 h-[700px] w-[700px] rounded-full bg-purple-700 blur-[140px]" />
        <div className="animate-orb-delay absolute top-1/2 -right-48 h-[550px] w-[550px] rounded-full bg-violet-600 blur-[130px]" />
        <div className="animate-orb-slow absolute -bottom-32 left-1/3 h-[450px] w-[450px] rounded-full bg-indigo-900 blur-[120px]" />
      </div>

      {/* ── Navbar ── */}
      <header
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-black/[0.06] dark:border-white/[0.06] bg-[#f5f3ff]/75 dark:bg-[#06050f]/75 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/">
            <Logo className="h-8 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <a
              href="#features"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 dark:text-white/60 transition hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 dark:text-white/60 transition hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white"
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.10] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.05] text-gray-500 dark:text-white/60 transition hover:bg-black/[0.08] dark:hover:bg-white/[0.10] hover:text-gray-900 dark:hover:text-white"
            >
              {theme === 'dark' ? <FaSun className="text-xs" /> : <FaMoon className="text-xs" />}
            </button>

            {currentUser ? (
              <>
                <UserAvatar
                  displayName={currentUser.displayName}
                  email={currentUser.email}
                  onSignOut={logout}
                />
                <Link
                  to="/charting/custom"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500"
                >
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/log-in"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 dark:text-white/60 transition hover:text-gray-900 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/charting"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow shadow-purple-900/40 transition hover:bg-purple-500"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex min-h-screen items-center pt-20">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* Left: copy */}
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-300">
                Institutional-grade analytics
              </span>
            </div>

            <h1 className="mb-6 text-5xl leading-[1.08] font-extrabold tracking-tight lg:text-6xl xl:text-7xl">
              Market data that
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 bg-clip-text text-transparent">
                tells the story
              </span>
            </h1>

            <p className="mb-10 max-w-md text-lg leading-relaxed text-gray-500 dark:text-white/55">
              QuantEdge brings the analytics power of institutional trading
              desks to every investor — real data, stunning visuals, zero noise.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate('/charting')}
                className="group rounded-xl bg-purple-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-purple-500 hover:shadow-purple-800/50"
              >
                Start Analyzing
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </button>
              <Link
                to="/ticker-info"
                className="rounded-xl border border-black/[0.10] dark:border-white/10 px-8 py-3.5 text-base font-semibold text-gray-600 dark:text-white/70 transition hover:border-black/[0.20] dark:hover:border-white/20 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white"
              >
                Explore Tickers
              </Link>
            </div>
          </div>

          {/* Right: chart card */}
          <div className="animate-fade-up-delay relative">
            <div className="relative rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-6 shadow-2xl shadow-purple-950/20 dark:shadow-purple-950/40 backdrop-blur-sm">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <div className="text-xs font-medium tracking-widest text-gray-400 dark:text-white/40 uppercase">
                    AAPL · Apple Inc.
                  </div>
                  <div className="mt-1 text-3xl font-bold tracking-tight">
                    $189.42
                  </div>
                  <div className="mt-0.5 text-sm text-gray-400 dark:text-white/50">
                    +$4.57 today
                  </div>
                </div>
                <span className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  +2.47%
                </span>
              </div>

              <svg
                viewBox="0 0 380 140"
                className="w-full"
                preserveAspectRatio="none"
                style={{ height: '140px' }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#A855F7" />
                    <stop offset="100%" stopColor="#C084FC" />
                  </linearGradient>
                </defs>

                {[35, 70, 105].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="380"
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.06"
                    strokeWidth="1"
                  />
                ))}

                <path
                  d="M0,130 C30,126 55,118 80,108 C105,98 125,92 150,82 C175,72 195,64 220,54 C245,44 268,34 295,24 C318,15 345,9 370,4 L380,2 L380,140 L0,140 Z"
                  fill="url(#areaGrad)"
                />

                <path
                  pathLength="1"
                  d="M0,130 C30,126 55,118 80,108 C105,98 125,92 150,82 C175,72 195,64 220,54 C245,44 268,34 295,24 C318,15 345,9 370,4 L380,2"
                  stroke="url(#lineGrad)"
                  strokeWidth="2.5"
                  fill="none"
                  className="chart-draw"
                />

                <circle cx="380" cy="2" r="5" fill="#A855F7" fillOpacity="0.25" />
                <circle cx="380" cy="2" r="3" fill="#C084FC" />
              </svg>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[
                  { label: 'P/E Ratio', value: '28.5x' },
                  { label: 'Market Cap', value: '$2.94T' },
                  { label: 'Revenue', value: '$383B' },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl bg-black/[0.04] dark:bg-white/[0.04] p-3 text-center ring-1 ring-black/[0.05] dark:ring-white/[0.05]"
                  >
                    <div className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                      {m.label}
                    </div>
                    <div className="mt-0.5 text-sm font-bold">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating metric cards */}
            <div className="animate-float absolute top-1/3 -right-6 z-10 rounded-xl border border-purple-500/20 bg-white/90 dark:bg-[#0d0b1e]/90 px-4 py-3 shadow-xl backdrop-blur-md">
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/45">
                Revenue Growth
              </div>
              <div className="mt-0.5 text-base font-bold text-emerald-500 dark:text-emerald-400">
                ↑ 12.4%
              </div>
            </div>

            <div className="animate-float-slow absolute -bottom-5 -left-5 z-10 rounded-xl border border-purple-500/20 bg-white/90 dark:bg-[#0d0b1e]/90 px-4 py-3 shadow-xl backdrop-blur-md">
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/45">
                EPS (TTM)
              </div>
              <div className="mt-0.5 text-base font-bold">$6.43</div>
            </div>

            <div className="animate-float-mid absolute -top-5 left-1/2 z-10 -translate-x-1/2 rounded-xl border border-purple-500/20 bg-white/90 dark:bg-[#0d0b1e]/90 px-4 py-3 shadow-xl backdrop-blur-md">
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/45">
                Div. Yield
              </div>
              <div className="mt-0.5 text-base font-bold text-purple-600 dark:text-purple-300">
                0.51%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <div ref={statsReveal.ref} className={revealClass(statsReveal.visible)}>
        <div className="border-y border-black/[0.07] dark:border-white/[0.05] bg-black/[0.03] dark:bg-white/[0.02]">
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
            {[
              { value: '50+', label: 'Financial Metrics' },
              { value: '20yr', label: 'Historical Data' },
              { value: '3', label: 'Chart Types' },
              { value: '100%', label: 'Customizable' },
            ].map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center px-6 py-10 ${i > 0 ? 'border-l border-black/[0.07] dark:border-white/[0.05]' : ''}`}
              >
                <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                  {s.value}
                </div>
                <div className="mt-1.5 text-sm text-gray-400 dark:text-white/45">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="py-32">
        <div
          ref={featuresReveal.ref}
          className={`mx-auto max-w-7xl px-6 ${revealClass(featuresReveal.visible)}`}
        >
          <div className="mb-16 text-center">
            <div className="mb-3 text-xs font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
              Features
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Everything you need to analyze
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-white/50">
              The tools professionals use — now available to everyone.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M7 17V9M12 17V13M17 17V7"
                      stroke="#A855F7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
                title: 'Multiple Chart Types',
                desc: 'Line, area, and bar charts — each optimized for different financial metrics and time horizons.',
              },
              {
                icon: (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" stroke="#A855F7" strokeWidth="2" />
                    <path
                      d="M12 7v5l3 3"
                      stroke="#A855F7"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
                title: 'Historically Accurate',
                desc: 'Access 20+ years of fundamental data and price history for any publicly traded company.',
              },
              {
                icon: (
                  <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#A855F7" strokeWidth="2" />
                  </svg>
                ),
                title: 'Custom Dashboards',
                desc: 'Build personalized analytics workspaces. Choose your tickers, pick your metrics, build your edge.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-black/[0.07] dark:border-white/[0.07] bg-black/[0.04] dark:bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:shadow-xl hover:shadow-purple-950/20 dark:hover:shadow-purple-950/30"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 ring-1 ring-purple-500/20 transition group-hover:bg-purple-500/15 group-hover:ring-purple-500/30">
                  {f.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold">{f.title}</h3>
                <p className="text-base leading-relaxed text-gray-500 dark:text-white/52">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-32">
        <div
          ref={howReveal.ref}
          className={`mx-auto max-w-7xl px-6 ${revealClass(howReveal.visible)}`}
        >
          <div className="mb-16 text-center">
            <div className="mb-3 text-xs font-bold tracking-widest text-purple-600 dark:text-purple-400 uppercase">
              How it works
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              From ticker to insight in seconds
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Choose a ticker',
                desc: 'Search for any publicly traded company and pull up its full financial profile instantly.',
              },
              {
                step: '02',
                title: 'Select your metrics',
                desc: 'Pick from 50+ fundamental and technical metrics. Mix and match for deep, custom analysis.',
              },
              {
                step: '03',
                title: 'Visualize & analyze',
                desc: 'Render interactive charts instantly. Build your investment thesis on real data.',
              },
            ].map((item) => (
              <div key={item.step} className="relative pl-2">
                <div className="mb-3 text-7xl leading-none font-black text-black/[0.05] dark:text-white/[0.05]">
                  {item.step}
                </div>
                <h3 className="mb-3 text-xl font-bold">{item.title}</h3>
                <p className="text-base leading-relaxed text-gray-500 dark:text-white/52">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32">
        <div
          ref={ctaReveal.ref}
          className={`mx-auto max-w-3xl px-6 text-center ${revealClass(ctaReveal.visible)}`}
        >
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-purple-900/25 to-transparent p-16 shadow-2xl shadow-purple-950/20 dark:shadow-purple-950/30 backdrop-blur-sm">
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Ready to find your edge?
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-gray-500 dark:text-white/52">
              Join thousands of investors using QuantEdge to make smarter,
              data-driven decisions.
            </p>
            <button
              onClick={() => navigate('/charting')}
              className="group rounded-xl bg-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:bg-purple-500 hover:shadow-purple-800/50"
            >
              Start for free
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-black/[0.07] dark:border-white/[0.05] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Logo className="h-6 w-auto opacity-80" />

          <div className="flex gap-6 text-sm text-gray-400 dark:text-white/40">
            <Link to="/contact-us" className="transition hover:text-gray-900 dark:hover:text-white">
              Feedback
            </Link>
          </div>

          <div className="text-sm text-gray-300 dark:text-white/30">
            © 2026 QuantEdge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
