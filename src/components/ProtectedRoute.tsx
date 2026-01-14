import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!authService.isAuthenticated()) {
    // Not logged in, redirect to login page
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
