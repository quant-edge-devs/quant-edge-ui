import { Navigate, type RouteObject } from 'react-router';
import { Landing } from './pages/landing/LandingPage';
import { MainLayout } from './layouts/MainLayout';
import { ContactUs } from './pages/contact-us/ContactUsPage';
import { Login } from './pages/log-in/LoginPage';
import { SignUp } from './pages/sign-up/SignUpPage';
import { Recover } from './pages/recover/RecoverPage';
import { Pricing } from './pages/pricing/PricingPage';
import { Tutorial } from './pages/tutorial/TutorialPage';
import { StartAnalyzing } from './pages/start-analyzing/StartAnalyzingPage';
import { Auth } from './pages/auth/AuthPage';
import { PresetChartsPage } from './pages/charting/PresetChartsPage';
import SelectDashboardTypePage from './pages/charting/welcome-modal/SelectDashboardTypePage';
import CustomChartsPage from './pages/charting/CustomChartsPage';
import TickerInfoPage from './pages/ticker-info/TickerInfoPage';

export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'contact-us', element: <ContactUs /> },
      { path: 'pricing', element: <Pricing /> },
      { path: 'charting', element: <SelectDashboardTypePage /> },
      { path: 'charting/preset', element: <PresetChartsPage /> },
      { path: 'charting/custom', element: <CustomChartsPage /> },
      { path: 'ticker-info', element: <TickerInfoPage /> },

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
