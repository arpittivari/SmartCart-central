import React, { useState, useEffect } from 'react';
import { Typography, Grid, Paper, Box, CircularProgress, Alert, useTheme } from '@mui/material';
import DashboardWidget from '../components/dashboard/DashboardWidget';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../contexts/AuthContext';
import { getSummary, AnalyticsSummary } from '../api/analyticsApi';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, 
} from 'recharts';

// Define some professional, eye-catching colors for our pie chart
const PIE_COLORS = ['#5e72e4', '#11cdef', '#2dce89', '#f5365c', '#fb6340'];

const AnalyticsPage = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const theme = useTheme(); // Use our theme's colors

  useEffect(() => {
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

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Analytics Overview
      </Typography>

      {/* --- WIDGETS --- */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <DashboardWidget
            title="Total Revenue"
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
            value={summary?.totalCarts || 0}
            icon={<ShoppingCartIcon sx={{ fontSize: 48 }} />}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* --- CHARTS --- */}
      <Grid container spacing={4}>
        {/* Line Chart: Revenue Over Time */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400, '& .recharts-cartesian-axis-tick-line': { stroke: theme.palette.text.secondary } }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Revenue Over Time</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary?.revenueData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }}
                  labelStyle={{ color: theme.palette.text.primary }} 
                />
                <Legend />
                <Line type="monotone" dataKey="Revenue" stroke={theme.palette.primary.main} strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Pie Chart: Top Categories */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400, '& .recharts-legend-item-text': { color: `${theme.palette.text.primary} !important` } }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Top Categories</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summary?.categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                >
                  {summary?.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: theme.palette.background.paper, border: 'none' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default AnalyticsPage;