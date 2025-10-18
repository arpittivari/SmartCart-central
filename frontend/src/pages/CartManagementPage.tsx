import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Alert, CircularProgress, Paper, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import CartsTable from '../components/dashboard/CartsTable';
import ClaimCartModal from '../components/dashboard/ClaimCartModal';
import RegisterCartModal from '../components/dashboard/RegisterCartModal';
import LiveCartView from '../components/dashboard/LiveCartView';
import { getCarts, Cart } from '../api/cartApi';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { useNotification } from '../contexts/NotificationContext';
import apiClient from '../api/apiClient';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface UnclaimedCart {
  _id: string;
  macAddress: string;
}

const CartManagementPage = () => {
  const [claimedCarts, setClaimedCarts] = useState<Cart[]>([]);
  const [unclaimedCarts, setUnclaimedCarts] = useState<UnclaimedCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for the two different workflows
  const [cartToClaim, setCartToClaim] = useState<UnclaimedCart | null>(null); // For the "Claim Cart" workflow
  const [registerModalOpen, setRegisterModalOpen] = useState(false); // For the "Register New Cart" workflow
  
  //const [liveViewCartId, setLiveViewCartId] = useState<string | null>(null);
  const [liveViewCart, setLiveViewCart] = useState<Cart | null>(null);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // --- WebSocket Listener for the "Claim" Workflow ---
  const handleNewUnclaimedCart = useCallback((newCart: UnclaimedCart) => {
    showNotification(`New cart detected: ${newCart.macAddress}`, 'info');
    setUnclaimedCarts(prev => {
      if (prev.some(c => c.macAddress === newCart.macAddress)) return prev;
      return [newCart, ...prev];
    });
  }, [showNotification]);
  const socket = useSocket('newUnclaimedCart', handleNewUnclaimedCart);
  
  useEffect(() => {
    if (socket && user?.mallId) {
      socket.emit('joinRoom', user.mallId);
    }
  }, [socket, user]);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
      const [claimedData, unclaimedData] = await Promise.all([
        getCarts(user.token),
        apiClient.get('/unclaimed', { headers: { Authorization: `Bearer ${user.token}` } })
      ]);
      setClaimedCarts(claimedData);
      setUnclaimedCarts(unclaimedData.data);
    } catch (err) {
      setError('Failed to fetch initial cart data.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // A universal handler to refresh data and show a notification after any successful action
  const handleSuccess = (message: string) => {
    showNotification(message, 'success');
    fetchData();
  };

  const handleReject = async (id: string) => { /* ... (this function is correct) ... */ };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Cart Fleet Management</Typography>
        
        {/* This is the "Register New Cart" button for your V5.0 workflow */}
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => setRegisterModalOpen(true)}
        >
          Register New Cart
        </Button>
      </Box>
      
      {/* This section is for the "Claim Cart" workflow (V3.1) */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>New Carts Detected (Claim Workflow)</Typography>
        {isLoading ? <CircularProgress size={24} /> : (
          unclaimedCarts.length === 0 ? (
            <Typography color="text.secondary">No new carts detected. Power on a new cart to begin provisioning.</Typography>
          ) : (
            <List>
              {unclaimedCarts.map(cart => (
                <ListItem
                  key={cart._id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button variant="outlined" color="secondary" onClick={() => handleReject(cart._id)}>Reject</Button>
                      <Button variant="contained" onClick={() => setCartToClaim(cart)}>Claim Cart</Button>
                    </Box>
                  }
                >
                  <ListItemText primary="New SmartCart Online" secondary={`MAC Address: ${cart.macAddress}`} />
                </ListItem>
              ))}
            </List>
          )
        )}
      </Paper>
      
      {/* This section shows all registered carts */}
      <Typography variant="h6" sx={{ mb: 2 }}>Registered Carts ({claimedCarts.length})</Typography>
      {isLoading ? <CircularProgress /> : 
        <CartsTable 
          carts={claimedCarts} 
          onCartDeleted={fetchData}
          // This now correctly passes the full cart object
          onViewLive={(cart: Cart) => setLiveViewCart(cart)}
        />
      }

      {/* Modals for both workflows */}
      <ClaimCartModal 
        open={!!cartToClaim} 
        onClose={() => setCartToClaim(null)} 
        onCartClaimed={() => handleSuccess('Cart claimed successfully!')} 
        macAddress={cartToClaim?.macAddress || null} 
      />
      <RegisterCartModal 
        open={registerModalOpen} 
        onClose={() => setRegisterModalOpen(false)} 
        onCartRegistered={() => handleSuccess('Cart registered successfully!')} 
      />
      <LiveCartView 
        open={!!liveViewCart}
        onClose={() => setLiveViewCart(null)}
        // This now correctly passes the full cart object
        cart={liveViewCart}
      />
    </Box>
  );
};

export default CartManagementPage;