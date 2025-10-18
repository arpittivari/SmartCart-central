import React, { useState, useEffect, useCallback } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, 
    Typography, Box, Divider, Chip, ListItemIcon 
} from '@mui/material';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useSocket } from '../../hooks/useSocket';
import { Cart } from '../../api/cartApi';

interface Item {
  product_id: string;
  product_name: string;
  price: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
}

const LiveCartView = ({ open, onClose, cart }: Props) => {
  const [currentCart, setCurrentCart] = useState<Cart | null>(cart);
  const items = currentCart?.currentItems || [];
  const total = items.reduce((sum, item) => sum + item.price, 0);

  // This function now receives the FULL updated cart state from the server
  const handleCartStateUpdate = useCallback((updatedCart: Cart) => {
    // We only update if the message is for the cart we're currently watching
    if (updatedCart._id === cart?._id) {
      setCurrentCart(updatedCart);
    }
  }, [cart]);

  // We now correctly listen for the 'cartStateUpdate' event from the backend
  const socket = useSocket('cartStateUpdate', handleCartStateUpdate);

  // This is the final, correct "private phone call" logic with cleanup
  useEffect(() => {
    if (open && socket && cart) {
      setCurrentCart(cart); // Set the initial state when the modal opens
      socket.emit('subscribeToCart', cart._id);
      console.log(`Subscribing to updates for cart: ${cart.cartId}`);
    }
    // This cleanup function runs when the modal closes
    return () => {
      if (socket && cart) {
        socket.emit('unsubscribeFromCart', cart._id);
        console.log(`Unsubscribing from updates for cart: ${cart.cartId}`);
      }
    };
  }, [open, cart, socket]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Live Shopping View: {currentCart?.cartId}
        {/* This is the new, live battery status indicator */}
        <Chip 
          icon={<BatteryChargingFullIcon />} 
          label={`${currentCart?.battery || 'N/A'}%`} 
          color={currentCart && currentCart.battery > 20 ? 'success' : 'error'} 
        />
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        {items.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
            <Typography color="text.secondary">Waiting for shopper to add the first item...</Typography>
          </Box>
        ) : (
          <List sx={{ flexGrow: 1, overflow: 'auto' }}>
            {items.map((item, index) => (
              <React.Fragment key={`${item.product_id}-${index}`}>
                <ListItem>
                  <ListItemIcon sx={{ minWidth: '40px' }}><ShoppingCartIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary={item.product_name} secondary={`ID: ${item.product_id}`} />
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>₹{item.price.toFixed(2)}</Typography>
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.default' }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{total.toFixed(2)}</Typography>
      </Box>
    </Dialog>
  );
};

export default LiveCartView;