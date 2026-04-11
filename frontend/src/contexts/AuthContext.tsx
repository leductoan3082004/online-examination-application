import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '../api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  studentTestId: number | null;
}

interface AuthContextValue extends AuthState {
  loginTeacher: (token: string, user: User) => void;
  loginStudent: (token: string, testId: number, studentId: number, studentName: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadInitialState(): AuthState {
  const token = sessionStorage.getItem('token');
  const userStr = sessionStorage.getItem('user');
  const testIdStr = sessionStorage.getItem('studentTestId');
  return {
    token,
    user: userStr ? JSON.parse(userStr) : null,
    studentTestId: testIdStr ? Number(testIdStr) : null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadInitialState);

  const loginTeacher = useCallback((token: string, user: User) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.removeItem('studentTestId');
    setState({ token, user, studentTestId: null });
  }, []);

  const loginStudent = useCallback((token: string, testId: number, studentId: number, studentName: string) => {
    const user: User = { id: studentId, name: studentName, email: '', role: 'STUDENT' };
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('studentTestId', String(testId));
    setState({ token, user, studentTestId: testId });
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('studentTestId');
    setState({ token: null, user: null, studentTestId: null });
  }, []);

  const value: AuthContextValue = {
    ...state,
    loginTeacher,
    loginStudent,
    logout,
    isAuthenticated: !!state.token,
    isTeacher: state.user?.role === 'TEACHER',
    isStudent: state.user?.role === 'STUDENT',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
