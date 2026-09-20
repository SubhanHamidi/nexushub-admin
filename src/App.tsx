import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OrgProvider } from './context/OrgContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/Auth';
import { DashboardPage } from './pages/Dashboard';

export default function App() {
  return (
    <AuthProvider>
      <OrgProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </OrgProvider>
    </AuthProvider>
  );
}