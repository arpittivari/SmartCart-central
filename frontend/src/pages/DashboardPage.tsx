import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Grid, Box, CircularProgress, Alert } from '@mui/material';
import CartsTable from '../components/dashboard/CartsTable';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import { useAuth } from '../contexts/AuthContext';
import { getCarts, Cart } from '../api/cartApi';
import { useSocket } from '../hooks/useSocket';

const DashboardPage = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Callback function for the socket to update a single cart in our list
  const handleCartUpdate = useCallback((updatedCart: Cart) => {
    setCarts(prevCarts => 
      prevCarts.map(cart => cart._id === updatedCart._id ? updatedCart : cart)
    );
  }, []);

  useSocket(handleCartUpdate); // Connect to the socket and listen for updates

  useEffect(() => {
    const fetchInitialCarts = async () => {
      if (!user?.token) return;
      try {
        const initialCarts = await getCarts(user.token);
        setCarts(initialCarts);
      } catch (err) {
        setError('Failed to load initial cart data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialCarts();
  }, [user]);

  // Calculate stats from the live cart data
  const totalCarts = carts.length;
  const activeCarts = carts.filter(c => c.status === 'Shopping' || c.status === 'Payment').length;
  const idleCarts = carts.filter(c => c.status === 'Idle').length;

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Live Fleet Monitor
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <DashboardWidget title="Total Carts" value={totalCarts} icon={<ShoppingCartIcon sx={{ fontSize: 48 }} />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DashboardWidget title="Carts In Use" value={activeCarts} icon={<RadioButtonCheckedIcon sx={{ fontSize: 48 }} />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <DashboardWidget title="Carts Idle" value={idleCarts} icon={<PauseCircleOutlineIcon sx={{ fontSize: 48 }} />} color="warning.main" />
        </Grid>
      </Grid>
      
      <CartsTable carts={carts} onCartDeleted={() => { /* Handled by CartManagementPage */ }} />
    </>
  );
};

export default DashboardPage;