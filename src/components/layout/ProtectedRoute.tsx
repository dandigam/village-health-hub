import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { hasAccess } from '@/config/routeAccess';

interface ProtectedRouteProps {
  routeKey: string;
  children: React.ReactNode;
}

export function ProtectedRoute({ routeKey, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess(routeKey, user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
