import React, { useState, useEffect } from 'react';
import { Typography, Grid, Box, CircularProgress, Alert, Paper } from '@mui/material';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../contexts/AuthContext';
import { getSummary, AnalyticsSummary } from '../api/analyticsApi';

const AnalyticsPage = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // This is the function that calls our backend to get the analytics data
    const fetchSummary = async () => {
      if (!user?.token) return;
      try {
        const data = await getSummary(user.token);
        setSummary(data);
      } catch (err) {
        setError('Failed to fetch analytics summary.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [user]);

  // This block shows a loading spinner while data is being fetched
  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  // This block shows an error message if the API call fails
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Analytics Overview
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <DashboardWidget
            title="Total Revenue"
            // Assuming amount is in paise, we convert to rupees and fix to 2 decimal places
            value={`₹${((summary?.totalRevenue || 0) / 100).toFixed(2)}`}
            icon={<MonetizationOnIcon sx={{ fontSize: 48 }} />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardWidget
            title="Total Transactions"
            value={summary?.totalTransactions || 0}
            icon={<PointOfSaleIcon sx={{ fontSize: 48 }} />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardWidget
            title="Total Carts in Fleet"
            value={summary?.cartCounts.total || 0}
            icon={<ShoppingCartIcon sx={{ fontSize: 48 }} />}
            color="info.main"
          />
        </Grid>
      </Grid>
      
      {/* This is the placeholder for future charts */}
      <Paper sx={{ mt: 4, p: 2, minHeight: 400 }}>
        <Typography variant="h5">Data Charts</Typography>
        <Typography sx={{ mt: 2 }}>(Future development: Charts will be built here to visualize revenue over time and cart usage.)</Typography>
      </Paper>
    </>
  );
};

export default AnalyticsPage;