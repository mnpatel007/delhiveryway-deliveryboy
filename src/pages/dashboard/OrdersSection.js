import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, Snackbar, Alert, Switch, CircularProgress } from '@mui/material';
import { MdDeliveryDining, MdCheckCircle, MdDirectionsBike, MdLocationOn, MdCall, MdChat, MdNotificationsActive } from 'react-icons/md';

const steps = ['Accepted', 'Picked Up', 'En Route', 'Delivered'];

export default function OrdersSection({ darkMode, deliveryBoy }) {
  // Simulated real-time order feed
  const [order, setOrder] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [online, setOnline] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);

  // Simulate receiving a new order
  useEffect(() => {
    if (!order && online) {
      setTimeout(() => {
        setOrder({
          id: 'ORDER123',
          customer: 'Rahul Sharma',
          address: '123 Main St, City',
          phone: '+91 98765 43210',
          items: [
            { name: 'Pizza', qty: 1 },
            { name: 'Burger', qty: 2 },
          ],
          earnings: 45,
        });
        setSnackbar({ open: true, message: 'New delivery assigned!', severity: 'success' });
      }, 2000);
    }
  }, [order, online]);

  const handleStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      setSnackbar({ open: true, message: `Status updated: ${steps[activeStep + 1]}`, severity: 'info' });
    } else {
      setOrder(null);
      setActiveStep(0);
      setSnackbar({ open: true, message: 'Delivery completed!', severity: 'success' });
    }
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <MdNotificationsActive size={28} color={online ? '#43a047' : '#bdbdbd'} style={{ marginRight: 8 }} />
        <Typography variant="h6">Live Orders</Typography>
        <Box flexGrow={1} />
        <Typography variant="body2">Online</Typography>
        <Switch checked={online} onChange={() => setOnline(!online)} color="success" />
      </Box>
      {order ? (
        <Paper elevation={3} sx={{ p: 3, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
          <Typography variant="subtitle1" gutterBottom>Order ID: {order.id}</Typography>
          <Typography variant="body1"><MdLocationOn /> {order.address}</Typography>
          <Typography variant="body2">Customer: {order.customer}</Typography>
          <Typography variant="body2">Phone: <Button startIcon={<MdCall />} size="small">Call</Button> <Button startIcon={<MdChat />} size="small">Chat</Button></Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Items:</Typography>
          <ul>
            {order.items.map((item, idx) => (
              <li key={idx}>{item.qty} x {item.name}</li>
            ))}
          </ul>
          <Typography variant="body2" sx={{ mt: 1 }}>Earnings: ₹{order.earnings}</Typography>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2, mb: 2 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Button variant="contained" color="primary" onClick={handleStep} endIcon={<MdCheckCircle />}>
            {activeStep < steps.length - 1 ? `Mark as ${steps[activeStep + 1]}` : 'Complete Delivery'}
          </Button>
        </Paper>
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
          {loading ? <CircularProgress /> : <MdDeliveryDining size={64} color="#bdbdbd" />}
          <Typography variant="h6" color="textSecondary" mt={2}>No active orders</Typography>
        </Box>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
