import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@headlessui/react';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from '../../components/navbar/UserAvatar';

export const Landing = () => {
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1E1B4B_30%,_#0F172A_100%)]">
      {/* Header */}
      <header className="flex items-center justify-between px-12 py-6">
        <div className="flex items-center gap-4">
          <span className="rounded-xl bg-[#672eeb] p-2">
            {/* Logo icon */}
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
        <nav className="flex items-center gap-4">
          {currentUser && (
            <UserAvatar
              displayName={currentUser.displayName}
              email={currentUser.email}
              onSignOut={signOut}
            />
          )}
          {!currentUser && (
            <Link
              to="/auth/log-in"
              className="text-lg font-medium text-white transition hover:text-fuchsia-400"
            >
              Sign In
            </Link>
          )}
          {currentUser ? (
            <Link
              to="/charting/custom"
              className="ml-2 rounded-lg bg-[#672eeb] px-6 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#5a27c8]"
            >
              Go to your Dashboard
            </Link>
          ) : (
            <Link
              to="/charting"
              className="ml-2 rounded-lg bg-[#672eeb] px-6 py-2 text-lg font-semibold text-white shadow transition hover:bg-[#5a27c8]"
            >
              Get Started
            </Link>
          )}
        </nav>
      </header>
      {/* Main content */}
      <main className="animate-float-in flex flex-col items-center justify-center px-4 pt-10 pb-16">
        {/* <div className="mb-6 flex w-full justify-center">
          <span className="rounded-full bg-fuchsia-900/30 px-6 py-2 text-lg font-medium text-fuchsia-200 shadow">
            <span className="inline-flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 2v2m6.364 1.636l-1.414 1.414M22 12h-2M19.364 19.364l-1.414-1.414M12 22v-2M4.636 19.364l1.414-1.414M2 12h2M4.636 4.636l1.414 1.414"
                  stroke="#a21caf"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Institutional-Grade Analytics
            </span>
          </span>
        </div> */}
        <h1 className="mb-8 text-center text-5xl leading-tight font-extrabold tracking-tight md:text-7xl">
          <span className="text-white">Welcome to </span>
          <span className="text-[#8B5CF6]">QuantEdge</span>
        </h1>
        <div className="mb-7 text-center text-2xl font-medium text-slate-300 md:text-3xl">
          Bringing institutional-grade analytics to retail investors
        </div>
        <div className="mb-8 bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-center text-3xl font-extrabold text-transparent md:text-5xl">
          <span className="text-[#8B5CF6]">Raw Data. </span>
          <span className="text-[#9671ee]">Real Stories. </span>
          <span className="text-white">Stunning Visuals.</span>
        </div>
        <Button
          className="mt-4 cursor-pointer rounded-lg bg-[#672eeb] bg-gradient-to-r px-10 py-4 text-xl font-semibold text-white shadow-lg transition hover:bg-[#5a27c8]"
          onClick={() => navigate('/charting')}
        >
          Start Analyzing
        </Button>
      </main>
      {/* Features section */}
      <section className="mx-auto mt-4 mb-10 flex w-full max-w-7xl flex-col items-center justify-center px-4">
        <div className="grid w-full gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="group rounded-2xl border border-[#23203a]/60 bg-[#181a2a] p-8 shadow-lg transition hover:bg-[#23203a] hover:shadow-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#672eeb]/20">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="12" fill="#8B5CF6" />
                <path
                  d="M10 22V12M16 22V16M22 22V10"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold text-white">
              Multiple Chart Types
            </div>
            <div className="text-md text-slate-300">
              Line, area, and bar charts to visualize any metric
            </div>
          </div>
          {/* Card 2 */}
          <div className="group rounded-2xl border border-[#23203a]/60 bg-[#181a2a] p-8 shadow-lg transition hover:bg-[#23203a] hover:shadow-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#672eeb]/20">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="12" fill="#8B5CF6" />
                <ellipse
                  cx="16"
                  cy="16"
                  rx="7"
                  ry="7"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <circle cx="16" cy="16" r="2.5" fill="#fff" />
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold text-white">
              Historically Accurate Data
            </div>
            <div className="text-md text-slate-300">
              Access historical market data and fundamental metrics
            </div>
          </div>
          {/* Card 3 */}
          <div className="group rounded-2xl border border-[#23203a]/60 bg-[#181a2a] p-8 shadow-lg transition hover:bg-[#23203a] hover:shadow-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[#672eeb]/20">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="12" fill="#8B5CF6" />
                <path
                  d="M16 10c-3 0-6 2-6 5.5 0 4.5 6 7.5 6 7.5s6-3 6-7.5C22 12 19 10 16 10z"
                  stroke="#fff"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
            <div className="mb-2 text-xl font-bold text-white">
              Custom Analytics
            </div>
            <div className="text-md text-slate-300">
              Build personalized dashboards for your research
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full border-t border-[#23203a]/60 bg-transparent px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-[#672eeb] p-2">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="12" fill="#672eeb" />
                <path
                  d="M10 22V12M16 22V16M22 22V10"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-lg font-bold text-white">QuantEdge</span>
          </div>
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-6">
            <a
              href="#"
              className="text-sm font-medium text-slate-300 transition hover:text-[#8B5CF6]"
            >
              Feedback
            </a>
            <span className="text-sm text-slate-400">
              © 2026 QuantEdge. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
