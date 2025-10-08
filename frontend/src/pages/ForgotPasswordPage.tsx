import React, { useState } from 'react';
import { Container, Box, TextField, Button, Typography, Alert, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import apiClient from '../api/apiClient';

const ForgotPasswordPage = () => {
  const [mallId, setMallId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/admin/forgotpassword', { mallId });
      setSuccess('If an account with that Mall ID exists, a reset token has been generated. Please check your backend server console for the reset URL.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Enter your Mall ID to receive a password reset link on the server console.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2, width: '100%' }}>{success}</Alert>}
          <TextField
            margin="normal"
            required
            fullWidth
            id="mallId"
            label="Mall ID"
            name="mallId"
            autoFocus
            value={mallId}
            onChange={(e) => setMallId(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Request Reset'}
          </Button>
          <Link component={RouterLink} to="/login" variant="body2">
            Back to Login
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;