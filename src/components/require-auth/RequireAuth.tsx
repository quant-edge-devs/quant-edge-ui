import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';

export const RequireAuth = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/auth/log-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
