import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Grid, Box, CircularProgress, Alert, Paper } from '@mui/material';
import CartsTable from '../components/dashboard/CartsTable';
import LiveCartView from '../components/dashboard/LiveCartView';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import CableIcon from '@mui/icons-material/Cable';
import { useAuth } from '../contexts/AuthContext';
import { getCarts, Cart } from '../api/cartApi';
import { useSocket } from '../hooks/useSocket';

const DashboardPage = () => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  //const [liveViewCartId, setLiveViewCartId] = useState<string | null>(null);
  const [liveViewCart, setLiveViewCart] = useState<Cart | null>(null);
  const { user } = useAuth();

  const handleCartUpdate = useCallback((updatedCart: Cart) => {
    // This function updates the main list of carts when a new heartbeat arrives.
    // The dependency fix ensures it always has the latest version of the list to update.
    setCarts(prevCarts => 
      prevCarts.map(cart => cart._id === updatedCart._id ? updatedCart : cart)
    );
  }, [setCarts]);

  useSocket('cartUpdate', handleCartUpdate);

  const fetchCarts = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
      const initialCarts = await getCarts(user.token);
      setCarts(initialCarts);
    } catch (err) {
      setError('Failed to load initial cart data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  const totalCarts = carts.length;
  const activeCarts = carts.filter(c => c.status === 'Shopping' || c.status === 'Payment').length;
  const idleCarts = carts.filter(c => c.status === 'Idle').length;
  const offlineCarts = carts.filter(c => c.status === 'Offline').length;

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
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Total Carts" value={totalCarts} icon={<ShoppingCartIcon sx={{ fontSize: 48 }} />} color="primary.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Carts In Use" value={activeCarts} icon={<RadioButtonCheckedIcon sx={{ fontSize: 48 }} />} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Carts Idle" value={idleCarts} icon={<PauseCircleOutlineIcon sx={{ fontSize: 48 }} />} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardWidget title="Carts Offline" value={offlineCarts} icon={<CableIcon sx={{ fontSize: 48 }} />} color="error.main" />
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Live Fleet Status</Typography>
        <CartsTable 
          carts={carts} 
          onCartDeleted={fetchCarts}
          // This now correctly passes the full cart object
          onViewLive={(cart: Cart) => setLiveViewCart(cart)}
        />
      
      </Paper>

      <LiveCartView 
        open={!!liveViewCart}
        onClose={() => setLiveViewCart(null)}
        // This now correctly passes the full cart object
        cart={liveViewCart}
      />
    </>
  );
};

export default DashboardPage;