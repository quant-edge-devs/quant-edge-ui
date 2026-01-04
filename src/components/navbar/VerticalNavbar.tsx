import { useState } from 'react';
import { FaBars, FaHome, FaSearch } from 'react-icons/fa';

export default function VerticalNavbar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen border-r border-fuchsia-700/40 bg-[#181425] transition-all duration-300 ${collapsed ? 'w-16' : 'w-48'} flex flex-col`}
    >
      <button
        className="p-4 text-fuchsia-400 focus:outline-none"
        onClick={() => setCollapsed((c) => !c)}
        aria-label="Toggle navbar"
      >
        <FaBars />
      </button>
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
    </div>
  );
}
