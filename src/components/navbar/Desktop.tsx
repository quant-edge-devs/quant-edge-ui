// import { Link, NavLink } from 'react-router';
// import { useAuth } from '../../contexts/AuthContext';
// import { FaSignOutAlt } from 'react-icons/fa';

// interface DesktopNavbarProps {
//   links: Array<{ to: string; label: string }>;
// }

// export const DesktopNavbar = ({ links }: DesktopNavbarProps) => {
//   const { currentUser, logout } = useAuth();
//   return (
//     <header className="flex items-center justify-between p-10">
//       <section className="flex items-center gap-8">
//         <Link to="/" className="flex cursor-pointer items-center">
//           <h1 className="bg-gradient-to-r from-fuchsia-400 to-purple-400 bg-clip-text text-5xl font-bold text-transparent xl:text-3xl">
//             QuantEdge
//           </h1>
//         </Link>
//         {currentUser && (
//           <span className="ml-6 text-lg font-medium text-white">
//             Hello, {currentUser.displayName || currentUser.email || 'User'}
//           </span>
//         )}
//       </section>
//       <nav className="flex items-center gap-4">
//         <ul className="flex space-x-5 text-xl xl:text-2xl">
//           {links.map((link) => (
//             <li key={link.to} className="text-xl text-white">
//               <NavLink
//                 to={link.to}
//                 className={({ isActive }) =>
//                   `cursor-pointer rounded-full px-4 py-2 transition-colors ${
//                     isActive
//                       ? 'bg-[rgba(229,231,235,0.2)]'
//                       : 'hover:bg-[rgba(229,231,235,0.2)]'
//                   }`
//                 }
//               >
//                 {link.label}
//               </NavLink>
//             </li>
//           ))}
//         </ul>
//         {/* Logout button on horizontal navbar */}
//         {currentUser && (
//           <button
//             className="ml-4 flex items-center gap-2 rounded bg-fuchsia-600 px-4 py-2 text-white hover:bg-fuchsia-700"
//             onClick={logout}
//           >
//             <FaSignOutAlt />
//             <span>Logout</span>
//           </button>
//         )}
//       </nav>
//     </header>
//   );
// };
