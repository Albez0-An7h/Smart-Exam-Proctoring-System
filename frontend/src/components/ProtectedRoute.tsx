import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  allowedRoles?: ('STUDENT' | 'TEACHER' | 'ADMIN')[];
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/dashboard'} replace />;
  }
  return <Outlet />;
}
