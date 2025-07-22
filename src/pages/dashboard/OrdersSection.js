import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stepper, Step, StepLabel, Snackbar, Alert, Switch, CircularProgress } from '@mui/material';
import { MdDeliveryDining, MdCheckCircle, MdDirectionsBike, MdLocationOn, MdCall, MdChat, MdNotificationsActive } from 'react-icons/md';

const steps = ['Accepted', 'Picked Up', 'En Route', 'Delivered'];

export default function OrdersSection({ darkMode, deliveryBoy }) {
  const [orders, setOrders] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [online, setOnline] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [loading, setLoading] = useState(true);

  // Fetch real assigned orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let token = localStorage.getItem('token');
        if (!token && deliveryBoy?.token) token = deliveryBoy.token;
        if (!token) return;
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    };
    if (online) fetchOrders();
    else setOrders([]);
  }, [online, deliveryBoy]);

  // Step logic for the first order (for demo, real app should track per order)
  const handleStep = async (orderId) => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
      setSnackbar({ open: true, message: `Status updated: ${steps[activeStep + 1]}`, severity: 'info' });
    } else {
      // Mark as delivered in backend
      try {
        let token = localStorage.getItem('token');
        if (!token && deliveryBoy?.token) token = deliveryBoy.token;
        if (!token) return;
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/complete`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setOrders(orders.filter(o => o._id !== orderId));
        setActiveStep(0);
        setSnackbar({ open: true, message: 'Delivery completed!', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to complete delivery', severity: 'error' });
      }
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
      {loading ? (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
          <CircularProgress />
        </Box>
      ) : orders.length > 0 ? (
        orders.map((order, idx) => (
          <Paper key={order._id} elevation={3} sx={{ p: 3, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
            <Typography variant="subtitle1" gutterBottom>Order ID: {order._id}</Typography>
            <Typography variant="body1"><MdLocationOn /> {order.address}</Typography>
            <Typography variant="body2">Shop: {order.items[0]?.productId?.shopId?.name || 'N/A'}</Typography>
            <Typography variant="body2">Shop Address: {order.items[0]?.productId?.shopId?.address || 'N/A'}</Typography>
            <Typography variant="body2">Customer: {order.customerId?.name || 'N/A'}</Typography>
            <Typography variant="body2">Customer Email: {order.customerId?.email || 'N/A'}</Typography>
            <Typography variant="body2">Phone: <Button startIcon={<MdCall />} size="small">Call</Button> <Button startIcon={<MdChat />} size="small">Chat</Button></Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>Items:</Typography>
            <ul>
              {order.items.map((item, i) => (
                <li key={i}>{item.quantity} x {item.productId?.name || 'N/A'}</li>
              ))}
            </ul>
            <Typography variant="body2" sx={{ mt: 1 }}>Earnings: ₹{order.totalAmount || 0}</Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2, mb: 2 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            <Button variant="contained" color="primary" onClick={() => handleStep(order._id)} endIcon={<MdCheckCircle />}>
              {activeStep < steps.length - 1 ? `Mark as ${steps[activeStep + 1]}` : 'Complete Delivery'}
            </Button>
          </Paper>
        ))
      ) : (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="300px">
          <MdDeliveryDining size={64} color="#bdbdbd" />
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
