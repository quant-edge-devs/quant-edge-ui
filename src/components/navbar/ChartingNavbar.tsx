import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import UserAvatar from './UserAvatar';

interface ChartingNavbarProps {
  activeMode?: 'preset' | 'custom';
}

export const ChartingNavbar = ({ activeMode }: ChartingNavbarProps) => {
  const { currentUser, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#06050f]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <Link to="/">
          <img src="/quantedge-logo.svg" alt="QuantEdge" className="h-8 w-auto" />
        </Link>

        {/* Mode tabs — only shown when on a specific mode */}
        {activeMode && (
          <div className="flex items-center rounded-xl bg-white/[0.05] p-1 ring-1 ring-white/[0.06]">
            <Link
              to="/charting/preset"
              className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition ${
                activeMode === 'preset'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Preset
            </Link>
            <Link
              to="/charting/custom"
              className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition ${
                activeMode === 'custom'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              Custom
            </Link>
          </div>
        )}

        {/* Right: feedback + user */}
        <div className="flex items-center gap-4">
          <Link
            to="/contact-us"
            className="text-sm font-medium text-white/50 transition hover:text-white"
          >
            Feedback
          </Link>
          {currentUser && (
            <UserAvatar
              displayName={currentUser.displayName}
              email={currentUser.email}
              onSignOut={logout}
            />
          )}
        </div>
      </div>
    </header>
  );
};
