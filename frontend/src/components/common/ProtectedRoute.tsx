import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();

  // --- Step 1: The "Patient Guard" ---
  // If the AuthContext is still checking localStorage, 'isLoading' will be true.
  // We must show a loading spinner and WAIT.
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // --- Step 2: The "Smart Guard" ---
  // This code only runs AFTER loading is finished.
  // If loading is finished AND the user is not null, they are allowed in.
  if (user) {
    return children; // Show the AppLayout and all its nested pages
  }

  // --- Step 3: The "Tough Guard" ---
  // If loading is finished AND the user is still null, they are not logged in.
  // Redirect them to the public Landing Page.
  return <Navigate to="/" replace />;
};

export default ProtectedRoute;