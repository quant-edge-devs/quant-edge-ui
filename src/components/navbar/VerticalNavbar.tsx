import { useState } from 'react';
import { FaBars, FaHome, FaSearch, FaSignOutAlt } from 'react-icons/fa';

export default function VerticalNavbar({
  collapsible = true,
  showLogout = false,
  onLogout,
}: {
  collapsible?: boolean;
  showLogout?: boolean;
  onLogout?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen border-r border-fuchsia-700/40 bg-[#181425] transition-all duration-300 ${collapsed ? 'w-20' : 'w-45'} flex flex-col`}
    >
      {collapsible && (
        <button
          className="cursor-pointer p-4 text-fuchsia-400 focus:outline-none"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle navbar"
        >
          <FaBars />
        </button>
      )}
      <nav className="mt-4 flex flex-col gap-4">
        <a
          href="/charting"
          className="flex items-center gap-3 rounded px-4 py-2 text-purple-200 transition hover:bg-[#231133]"
        >
          <FaHome />
          {!collapsed && <span>Home</span>}
        </a>

        <a href="/start-analyzing">
          <span className="flex items-center gap-3 rounded px-4 py-2 text-purple-200 transition hover:bg-[#231133]">
            <FaSearch />
            {!collapsed && <span>Search Tickers</span>}
          </span>
        </a>
      </nav>
      {showLogout && (
        <button
          className="mx-4 mt-auto mb-4 flex cursor-pointer items-center gap-2 rounded bg-fuchsia-600 px-4 py-2 text-white hover:bg-fuchsia-700"
          onClick={onLogout}
        >
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </button>
      )}
    </div>
  );
}
