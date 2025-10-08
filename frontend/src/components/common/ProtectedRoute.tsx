import React from 'react'; // 👈 Make sure React is imported
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Define the type for the component's props
type ProtectedRouteProps = {
  children: React.ReactNode; // 👈 Use React.ReactNode for more flexibility
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;