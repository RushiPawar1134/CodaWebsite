import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/hooks/useAuthStore';
import type { Role } from '@/types/auth';

interface ProtectedRouteProps {
  allow: Role[]; // e.g. ['ADMIN'] or ['USER', 'ADMIN']
  redirectTo?: string;
}

export default function ProtectedRoute({ allow, redirectTo = '/' }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  const hasRole = useAuthStore((s) => s.hasRole);

  if (!user) return <Navigate to={redirectTo} replace />;
  if (!hasRole(allow)) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}