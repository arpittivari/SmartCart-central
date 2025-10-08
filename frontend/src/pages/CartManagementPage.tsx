import React, { useState, useEffect, useCallback } from 'react';
import { 
    Typography, 
    Box, 
    Alert, 
    CircularProgress, 
    Grid, 
    TextField, 
    Button, 
    Paper 
} from '@mui/material';
import CartsTable from '../components/dashboard/CartsTable';
import { getCarts, Cart, registerCart, RegisterCartData } from '../api/cartApi';
import { useAuth } from '../contexts/AuthContext';

const CartManagementPage = () => {
  // State for the list of carts
  const [carts, setCarts] = useState<Cart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState('');

  // State for the inline registration form
  const [formState, setFormState] = useState({ cartId: '', macAddress: '', firmwareVersion: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Function to fetch the list of carts from the backend
  const fetchCarts = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
      const data = await getCarts(user.token);
      setCarts(data);
    } catch (err) {
      setListError('Failed to fetch the list of carts.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch carts when the component first loads
  useEffect(() => {
    fetchCarts();
  }, [fetchCarts]);

  // Handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({ ...prevState, [name]: value }));
  };

  // Handler for submitting the new cart registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;
    setIsSubmitting(true);
    setFormError('');

    const cartData: RegisterCartData = {
      cartId: formState.cartId,
      macAddress: formState.macAddress,
      firmwareVersion: formState.firmwareVersion || undefined,
    };

    try {
      await registerCart(cartData, user.token);
      setFormState({ cartId: '', macAddress: '', firmwareVersion: '' }); // Clear form on success
      fetchCarts(); // Refresh the table with the new cart
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Cart Fleet Management
      </Typography>
      
      {/* Inline Registration Form - Styled like your screenshot */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Register a New Cart</Typography>
        <Box component="form" onSubmit={handleRegisterSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Cart ID" name="cartId" placeholder="e.g., CART_001" value={formState.cartId} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="MAC Address" name="macAddress" placeholder="AA:BB:CC:DD:EE:FF" value={formState.macAddress} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="Firmware Version" name="firmwareVersion" placeholder="1.3.0-final" value={formState.firmwareVersion} onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button type="submit" variant="contained" fullWidth sx={{ height: '56px' }} disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Register Cart'}
              </Button>
            </Grid>
          </Grid>
          {formError && <Alert severity="error" sx={{ mt: 2 }}>{formError}</Alert>}
        </Box>
      </Paper>

      {/* Carts Table Section */}
      <Typography variant="h6" sx={{ mb: 2 }}>Registered Carts ({carts.length})</Typography>
      {listError && <Alert severity="error">{listError}</Alert>}
      {isLoading 
        ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box> 
        : <CartsTable carts={carts} onCartDeleted={fetchCarts} />
      }
    </Box>
  );
};

export default CartManagementPage;