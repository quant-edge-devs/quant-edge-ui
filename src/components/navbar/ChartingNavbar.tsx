import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserAvatar from './UserAvatar';
import { Logo } from '../Logo';
import { FaSun, FaMoon } from 'react-icons/fa';

interface ChartingNavbarProps {
  activeMode?: 'preset' | 'custom';
}

export const ChartingNavbar = ({ activeMode }: ChartingNavbarProps) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.07] bg-[#f5f3ff]/85 dark:border-white/[0.06] dark:bg-[#06050f]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link to="/">
          <Logo className="h-8 w-auto" />
        </Link>

        {activeMode && (
          <div className="flex items-center rounded-xl bg-black/[0.05] dark:bg-white/[0.05] p-1 ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
            <Link
              to="/charting/preset"
              className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition ${
                activeMode === 'preset'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Preset
            </Link>
            <Link
              to="/charting/custom"
              className={`rounded-lg px-5 py-1.5 text-sm font-semibold transition ${
                activeMode === 'custom'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Custom
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          <Link
            to="/contact-us"
            className="text-sm font-medium text-gray-500 dark:text-white/50 transition hover:text-gray-900 dark:hover:text-white"
          >
            Feedback
          </Link>

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-black/[0.10] dark:border-white/[0.12] bg-black/[0.04] dark:bg-white/[0.05] text-gray-500 dark:text-white/60 transition hover:bg-black/[0.08] dark:hover:bg-white/[0.10] hover:text-gray-900 dark:hover:text-white"
          >
            {theme === 'dark' ? <FaSun className="text-xs" /> : <FaMoon className="text-xs" />}
          </button>

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
