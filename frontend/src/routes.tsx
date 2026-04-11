import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/auth/RegisterPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/teacher/DashboardPage';
import CreateTestPage from './pages/teacher/CreateTestPage';
import EditTestPage from './pages/teacher/EditTestPage';
import LandingPage from './pages/student/LandingPage';
import TestPage from './pages/student/TestPage';
import ResultPage from './pages/student/ResultPage';
import PastResultsPage from './pages/student/PastResultsPage';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="TEACHER">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tests/new"
              element={
                <ProtectedRoute role="TEACHER">
                  <CreateTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/tests/:testId/edit"
              element={
                <ProtectedRoute role="TEACHER">
                  <EditTestPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/test/:testId"
              element={
                <ProtectedRoute role="STUDENT">
                  <TestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/results/:attemptId"
              element={
                <ProtectedRoute role="STUDENT">
                  <ResultPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-results"
              element={
                <ProtectedRoute role="STUDENT">
                  <PastResultsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
