import { Navigate, type RouteObject } from 'react-router';
import { Landing } from './pages/landing';
import { MainLayout } from './layouts';
import { ContactUs } from './pages/contact-us';
import { About } from './pages/about';
import { Login } from './pages/log-in';
import { SignUp } from './pages/sign-up';
import { Recover } from './pages/recover';
import { Pricing } from './pages/pricing';
import { Tutorial } from './pages/tutorial';
import { StartAnalyzing } from './pages/start-analyzing';
import { Auth } from './pages/auth';
import { PresetChartsPage } from './pages/charting/PresetChartsPage';
import SelectDashboardTypePage from './pages/charting/welcome-modal/SelectDashboardTypePage';
import CustomChartsPage from './pages/charting/CustomChartsPage';

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'about', element: <About /> },
      { path: 'contact-us', element: <ContactUs /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'charting', element: <SelectDashboardTypePage /> },
      { path: 'charting/preset', element: <PresetChartsPage /> },
      { path: 'charting/custom', element: <CustomChartsPage /> },

      {
        path: 'auth',
        element: <Auth />,
        children: [
          { index: true, element: <Navigate to="log-in" /> },
          { path: 'log-in', element: <Login /> },
          { path: 'recover', element: <Recover /> },
          { path: 'sign-up', element: <SignUp /> },
        ],
      },

      { path: 'start-analyzing', element: <StartAnalyzing /> },
      { path: 'tutorial', element: <Tutorial /> },

      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
];
