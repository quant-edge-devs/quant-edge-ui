import { Outlet } from 'react-router';

export const MainLayout = () => {
  return (
    <div className="font-inter min-h-screen bg-[#f0eeff] dark:bg-[#1a0820]">
      <main>
        <Outlet />
      </main>
    </div>
  );
};
