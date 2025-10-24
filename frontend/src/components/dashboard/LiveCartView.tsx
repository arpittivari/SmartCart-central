import React, { useState, useEffect, useCallback } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, 
    Typography, Box, Divider, Chip, IconButton 
} from '@mui/material';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import { useSocket } from '../../hooks/useSocket';
import { Cart } from '../../api/cartApi';

// This is the correct, final "blueprint" for an item in the cart
interface Item {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cart: Cart | null;
}

const LiveCartView = ({ open, onClose, cart }: Props) => {
  const [currentCart, setCurrentCart] = useState<Cart | null>(cart);
  
  // This is the correct, aggregated list of items
  const items: Item[] = currentCart?.currentItems || [];
  
  // --- THIS IS THE FIX for the total calculation ---
  // It now correctly multiplies the price by the quantity
  const totalCost = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // This function now receives the FULL updated cart state
  const handleCartStateUpdate = useCallback((updatedCart: Cart) => {
    if (updatedCart._id === cart?._id) {
      setCurrentCart(updatedCart);
    }
  }, [cart]);

  // This correctly listens for the 'cartStateUpdate' event
  const socket = useSocket('cartStateUpdate', handleCartStateUpdate);

  // This is the "Dedicated Security Monitor" logic
  useEffect(() => {
    if (open && socket && cart) {
      setCurrentCart(cart); // Set the initial state when the modal opens
      socket.emit('subscribeToCart', cart._id);
    }
    return () => {
      if (socket && cart) {
        socket.emit('unsubscribeFromCart', cart._id);
      }
    };
  }, [open, cart, socket]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      // We keep your new, professional styling
      sx={{ 
        '& .MuiDialog-paper': { 
          width: '400px', 
          height: 'auto', 
          maxHeight: '90vh',
          borderRadius: 2
        } 
      }}
    >
      {/* We keep your new, professional Title bar */}
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        py: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Live Cart: {currentCart?.cartId}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            icon={<BatteryChargingFullIcon />} 
            label={`${currentCart?.battery || 'N/A'}%`} 
            size="small"
            color={currentCart && currentCart.battery > 20 ? 'success' : 'error'} 
          />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      {/* This is the simplified, correct list of items */}
      <DialogContent dividers sx={{ p: 0, flex: 1 }}>
        {items.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <ShoppingCartIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">Waiting for shopper to add items...</Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {items.map((item, index) => (
              <React.Fragment key={item.product_id}>
                <ListItem sx={{ py: 2, px: 3 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {item.product_name}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        ₹{item.price.toFixed(2)} each
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Qty: {item.quantity}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
                {index < items.length - 1 && (
                  <Divider component="li" sx={{ mx: 3 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      
      {/* This is the new, simplified "Total" footer */}
      <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" color="text.secondary">
            Total Items
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {totalItems}
          </Typography>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total Cost</Typography>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{totalCost.toFixed(2)}</Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default LiveCartView;