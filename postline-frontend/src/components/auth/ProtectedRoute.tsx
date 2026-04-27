import type { ReactElement } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types/user';

interface ProtectedRouteProps {
  element: ReactElement;
  allowedRoles: Role[];
}

const ProtectedRoute = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token || !user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ mode: 'login', from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    const fallbackPath = user.role === 'admin'
      ? '/admin'
      : user.role === 'operator'
        ? '/operator'
        : user.role === 'courier'
          ? '/courier'
          : '/client';

    return <Navigate to={fallbackPath} replace />;
  }

  return element;
};

export default ProtectedRoute;
