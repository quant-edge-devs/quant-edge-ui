import { Link, NavLink } from 'react-router';

interface DesktopNavbarProps {
  links: Array<{ to: string; label: string }>;
}

export const DesktopNavbar = ({ links }: DesktopNavbarProps) => {
  return (
    <header className="flex items-center justify-between p-10">
      <section>
        <Link to="/" className="flex cursor-pointer items-center">
          <h1 className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent xl:text-3xl">
            QuantEdge
          </h1>
        </Link>
      </section>
      <nav>
        <ul className="flex space-x-5 text-xl xl:text-2xl">
          {links.map((link) => (
            <li key={link.to} className="text-xl text-white">
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `cursor-pointer rounded-full px-4 py-2 transition-colors ${
                    isActive
                      ? 'bg-[rgba(229,231,235,0.2)]'
                      : 'hover:bg-[rgba(229,231,235,0.2)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
