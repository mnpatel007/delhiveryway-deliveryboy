import React from 'react';
import { Box, Typography, Paper, Divider, LinearProgress } from '@mui/material';
import { MdAttachMoney } from 'react-icons/md';

export default function EarningsSection({ darkMode, deliveryBoy }) {
  // Simulated earnings data
  const earnings = {
    today: 120,
    week: 780,
    month: 3120,
    target: 5000,
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdAttachMoney /> Earnings</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
        <Typography variant="subtitle1">Today's Earnings</Typography>
        <Typography variant="h4" color="success.main">₹{earnings.today}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">This Week</Typography>
        <Typography variant="h5">₹{earnings.week}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">This Month</Typography>
        <Typography variant="h5">₹{earnings.month}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2">Monthly Target</Typography>
        <LinearProgress variant="determinate" value={earnings.month / earnings.target * 100} sx={{ height: 10, borderRadius: 5, mb: 1 }} />
        <Typography variant="body2">₹{earnings.month} / ₹{earnings.target}</Typography>
      </Paper>
    </Box>
  );
}
