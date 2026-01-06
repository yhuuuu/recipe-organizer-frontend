import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!authService.isAuthenticated()) {
    // 未登录，重定向到登录页
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
