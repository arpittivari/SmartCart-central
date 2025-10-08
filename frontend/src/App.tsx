import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CartManagementPage from './pages/CartManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AppLayout from './components/common/AppLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import { CssBaseline } from '@mui/material';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
function App() {
  const { user } = useAuth();

  return (
    <>
      <CssBaseline />
      <Router>
        <Routes>
          {/* These are the public routes, available when logged out */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
          <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPasswordPage />} />
          <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
          {/* This is the main parent route for all protected pages */}
          {/* It uses the AppLayout (sidebar + appbar) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* These are the child routes that will render inside the AppLayout */}
            <Route index element={<Navigate to="/dashboard" replace />} /> 
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="carts" element={<CartManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="products" element={<ProductsPage />} /> 
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          
        </Routes>
      </Router>
    </>
  );
}
export const getAuthToken = (): string | null => {
    const storedUser = localStorage.getItem('smartcartUser');
    if (storedUser) {
        return JSON.parse(storedUser).token;
    }
    return null;
}
export default App;