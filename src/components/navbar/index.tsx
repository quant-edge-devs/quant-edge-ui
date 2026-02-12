import { HorizontalNavbar } from './Horizontal';
import { MobileNavbar } from './Mobile';

export const links = [
  { to: '/contact-us', label: 'Contact us' },
  { to: '/about', label: 'About' },
  { to: '/tutorial', label: 'Tutorial' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/auth/log-in', label: 'Log in' },
  { to: '/charting', label: 'Charting' },
];

// No longer exporting a global Navbar. Use HorizontalNavbar or MobileNavbar directly where needed.
export { HorizontalNavbar, MobileNavbar };
