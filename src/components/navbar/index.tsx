import { DesktopNavbar } from './Desktop';
import { MobileNavbar } from './Mobile';

const links = [
  { to: '/contact-us', label: 'Contact us' },
  { to: '/about', label: 'About' },
  { to: '/tutorial', label: 'Tutorial' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/auth/log-in', label: 'Log in' },
  { to: '/charting', label: 'Charting' },
];

export const Navbar = () => {
  return (
    <>
      <div className="lg:hidden">
        <MobileNavbar links={links} />
      </div>
      <div className="hidden lg:block">
        <DesktopNavbar links={links} />
      </div>
    </>
  );
};
