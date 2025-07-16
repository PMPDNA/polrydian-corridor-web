import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminLogin from './AdminLogin';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}