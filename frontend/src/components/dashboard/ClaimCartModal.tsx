import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { registerCart } from '../../api/cartApi';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
  onCartClaimed: () => void;
  macAddress: string | null;
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

const ClaimCartModal = ({ open, onClose, onCartClaimed, macAddress }: Props) => {
  const [cartId, setCartId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Clear form when the modal opens/changes
  useEffect(() => {
    if (open) {
      setCartId('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!user?.token || !macAddress) return;
    setIsSubmitting(true);
    setError('');
    try {
      await registerCart({ cartId, macAddress }, user.token);
      onCartClaimed();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to claim cart.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">Claim New Cart</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Assign a friendly name to the cart with MAC address: <strong>{macAddress}</strong>
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <TextField
          margin="normal"
          required
          fullWidth
          label="Cart ID (e.g., CART-102)"
          value={cartId}
          onChange={(e) => setCartId(e.target.value)}
          autoFocus
        />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Claim Cart'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ClaimCartModal;