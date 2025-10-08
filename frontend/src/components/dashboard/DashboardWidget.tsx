import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactElement;
  color?: string;
}

const DashboardWidget = ({ title, value, icon, color = 'text.primary' }: Props) => {
  return (
    <Paper 
      sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: (theme) => `0px 10px 20px ${theme.palette.primary.main}33`,
        }
      }}
    >
      <Box>
        <Typography color="text.secondary" sx={{ mb: 1 }}>{title}</Typography>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
      </Box>
      <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
    </Paper>
  );
};

export default DashboardWidget;