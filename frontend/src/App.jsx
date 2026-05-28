import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import DashboardPage from './pages/DashboardPage';
import ParkingsPage from './pages/ParkingsPage';
import RegisterParkingPage from './pages/RegisterParkingPage';
import CarEntryPage from './pages/CarEntryPage';
import CarExitPage from './pages/CarExitPage';
import ReportsPage from './pages/ReportsPage';
import { useAuth } from './context/AuthContext';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parkings"
        element={
          <ProtectedRoute>
            <ParkingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parkings/register"
        element={
          <ProtectedRoute adminOnly>
            <RegisterParkingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entries/new"
        element={
          <ProtectedRoute>
            <CarEntryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entries/exit"
        element={
          <ProtectedRoute>
            <CarExitPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute adminOnly>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
