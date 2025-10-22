import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CssBaseline } from '@mui/material';

// --- Public Pages ---
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// --- Protected Admin Pages ---
import AppLayout from './components/common/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import CartManagementPage from './pages/CartManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { user } = useAuth();

  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* This is now the main entry point for your entire brand */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public auth routes. If the user is logged in, redirect them to their dashboard. */}
          <Route path="/login" element={user ? <Navigate to="/app/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/app/dashboard" /> : <RegisterPage />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/app/dashboard" /> : <ForgotPasswordPage />} />
          <Route path="/resetpassword/:token" element={user ? <Navigate to="/app/dashboard" /> : <ResetPasswordPage />} />

          {/* --- PROTECTED ADMIN ROUTES --- */}
          {/* All your private app pages now live under the '/app' path */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Child routes that will render inside the AppLayout */}
            <Route index element={<Navigate to="/app/dashboard" replace />} /> 
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="carts" element={<CartManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="products" element={<ProductsPage />} /> 
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
          {/* Fallback route: If no other route matches, redirect to the public landing page */}
          <Route path="*" element={<Navigate to="/" />} />
          
        </Routes>
      </Router>
    </>
  );
}

// The 'getAuthToken' function was removed from here.
// Its logic is correctly placed in your 'apiClient.ts' file.

export default App;