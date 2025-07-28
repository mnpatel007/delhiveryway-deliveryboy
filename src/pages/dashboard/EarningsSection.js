import React from 'react';
import { Box, Typography, Paper, Divider, LinearProgress } from '@mui/material';
import { MdAttachMoney } from 'react-icons/md';

export default React.memo(function EarningsSection({ darkMode, earnings }) {
  const target = 5000;
  return (
    <Box>
      <Typography variant="h6" mb={2}><MdAttachMoney /> Earnings</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
        <Typography variant="subtitle1">Today</Typography>
        <Typography variant="h4" color="success.main">₹{earnings.today.toFixed(2)}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">This Week</Typography>
        <Typography variant="h5">₹{earnings.week.toFixed(2)}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1">This Month</Typography>
        <Typography variant="h5">₹{earnings.month.toFixed(2)}</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2">Monthly Target</Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min((earnings.month / target) * 100, 100)}
          sx={{ height: 10, borderRadius: 5, mb: 1 }}
        />
        <Typography variant="body2">
          ₹{earnings.month.toFixed(2)} / ₹{target}
        </Typography>
      </Paper>
    </Box>
  );
});