import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { registerCart, Cart, RegisterCartData } from '../../api/cartApi';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onCartAdded: (newCart: Cart) => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const RegisterCartModal = ({ open, onClose, onCartAdded }: Props) => {
  const [cartId, setCartId] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [firmwareVersion, setFirmwareVersion] = useState(''); // 👈 New state for firmware
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Clear form when modal opens
  useEffect(() => {
    if (open) {
      setCartId('');
      setMacAddress('');
      setFirmwareVersion('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user?.token) {
      setError('Authentication error. Please log in again.');
      return;
    }
    setError('');

    const cartData: RegisterCartData = {
        cartId,
        macAddress,
        firmwareVersion: firmwareVersion || undefined, // Send undefined if empty
    };

    try {
      const newCart = await registerCart(cartData, user.token);
      onCartAdded(newCart);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register cart.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Register a New SmartCart</Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <TextField
          margin="normal"
          required
          fullWidth
          label="Cart ID (e.g., CART_001)"
          value={cartId}
          onChange={(e) => setCartId(e.target.value)}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="MAC Address"
          value={macAddress}
          onChange={(e) => setMacAddress(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Firmware Version (Optional)" // 👈 New field in the UI
          value={firmwareVersion}
          onChange={(e) => setFirmwareVersion(e.target.value)}
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained">
            Register Cart
            </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default RegisterCartModal;