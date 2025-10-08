import React, { useState, 
useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, Avatar, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
  const ProfilePage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({ mallName: '', brandName: '', location: '', email: '', mobileNumber: ''  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // This effect correctly populates the form from the global user context
    if (user) {
      setFormState({
        mallName: user.mallName || '',
        brandName: user.brandName || '',
        location: user.location || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await apiClient.put('/users/profile', formState, { headers: { Authorization: `Bearer ${user.token}` } });
      // Correctly merge the updated data while preserving the token
      login({ ...user, ...data });
      setSuccess('Profile details updated successfully!');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.token) return;
    
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Use the single, more reliable API endpoint
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      const { data: updatedUser } = await apiClient.put('/users/profile/avatar', formData, config);
      
      // Correctly merge the updated data while preserving the token
      login({ ...user, ...updatedUser });
      setSuccess('Image updated successfully!');
    } catch (err) {
      setError('Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
       
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>
        Admin Profile
      </Typography>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            {/* The cache-busting timestamp is included to always show the latest image */}
            <Avatar src={`http://localhost:5000${user?.imageUrl}?${new Date().getTime()}`} sx={{ width: 150, height: 150, margin: 'auto', mb: 2, border: '2px solid', borderColor: 'primary.main' }} />
            <Button variant="contained" component="label" disabled={uploading}>
              {uploading ? <CircularProgress size={24} color="inherit" /> : 'Upload Photo'}
              <input type="file" hidden accept="image/*,.png,.jpg,.jpeg" onChange={handleUpload} />
            </Button>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Recommended: Square image
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Profile Details</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
              <TextField name="mallName" label="Mall Name" value={formState.mallName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="brandName" label="Brand Name" value={formState.brandName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="email" label="Recovery Email" type="email" value={formState.email} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="mobileNumber" label="Mobile Number" value={formState.mobileNumber} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="location" label="Location (e.g., City, State)" value={formState.location} onChange={handleInputChange} fullWidth margin="normal" />
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate(-1)} // This will navigate to the previous page
              disabled={loading}
            >
              Back
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
          
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ProfilePage;