import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  const { isAuthenticated, isTeacher, isStudent, user, logout, studentTestId } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to={isTeacher ? '/dashboard' : '/'} className="text-xl font-bold text-indigo-600">
            ExamApp
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated && isTeacher && (
              <Link to="/dashboard" className="text-sm text-gray-600 hover:text-indigo-600">
                My Tests
              </Link>
            )}
            {isAuthenticated && isStudent && (
              <>
                {studentTestId && (
                  <Link to={`/test/${studentTestId}`} className="text-sm text-gray-600 hover:text-indigo-600">
                    Current Test
                  </Link>
                )}
                <Link to="/my-results" className="text-sm text-gray-600 hover:text-indigo-600">
                  My Results
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">
                Teacher Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
