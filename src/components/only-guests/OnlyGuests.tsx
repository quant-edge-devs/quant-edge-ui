import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export const OnlyGuests = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  return currentUser ? (
    <Navigate
      to={location.state?.from?.pathname ?? '/start-analyzing'}
      replace
    />
  ) : (
    <Outlet />
  );
};
