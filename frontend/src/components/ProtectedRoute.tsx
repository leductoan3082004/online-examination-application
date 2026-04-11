import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  role: 'TEACHER' | 'STUDENT';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={role === 'TEACHER' ? '/login' : '/'} replace />;
  }

  if (user?.role !== role) {
    return <Navigate to={user?.role === 'TEACHER' ? '/dashboard' : '/'} replace />;
  }

  return <>{children}</>;
}
