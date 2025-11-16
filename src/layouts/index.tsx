import { Outlet } from 'react-router';
import { Navbar } from '../components/navbar';

export const MainLayout = () => {
  return (
    <div className="font-inter min-h-screen bg-[#1a0820]">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
