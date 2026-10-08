import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { Role } from '@/types';
import { PageLoader } from './Spinner';

/** UX-only guard. The REAL authorization happens on the backend for every API call. */
export default function ProtectedRoute({ role }: { role: Role }) {
  const { user, status } = useAppSelector((s) => s.auth);
  const loc = useLocation();
  if (status === 'loading') return <PageLoader />;
  if (!user) return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  if (user.role !== role) return <Navigate to={user.role === 'seller' ? '/seller/dashboard' : '/'} replace />;
  return <Outlet />;
}
