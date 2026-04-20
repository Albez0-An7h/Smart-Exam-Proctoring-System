import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

interface Props {
  allowedRoles?: ('STUDENT' | 'TEACHER' | 'ADMIN')[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, user, initializing } = useAuth();

  // Token is in localStorage but hasn't been decoded yet — wait before redirecting
  if (initializing) return <Spinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/dashboard'} replace />;
  }
  return <Outlet />;
}
