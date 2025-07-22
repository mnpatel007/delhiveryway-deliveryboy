import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { MdHelp, MdChat, MdCall } from 'react-icons/md';

export default function SupportSection({ darkMode }) {
  return (
    <Box>
      <Typography variant="h6" mb={2}><MdHelp /> Support & Help</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
        <Typography variant="subtitle1">Need help?</Typography>
        <Typography variant="body2" color="textSecondary" mb={2}>
          If you have any issues with your deliveries, account, or app, you can contact our support team below.
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Button variant="contained" color="primary" startIcon={<MdChat />} sx={{ mr: 2 }}>Chat with Support</Button>
        <Button variant="outlined" color="secondary" startIcon={<MdCall />}>Call Support</Button>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="textSecondary">FAQ and Emergency Contact coming soon.</Typography>
      </Paper>
    </Box>
  );
}
