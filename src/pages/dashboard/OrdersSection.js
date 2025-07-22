// client-delivery/src/dashboard/OrdersSection.js
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { MdDeliveryDining, MdLocationOn, MdCheckCircle } from 'react-icons/md';
import io from 'socket.io-client';

export default function OrdersSection({ darkMode, deliveryBoy }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const token = localStorage.getItem('token') || deliveryBoy?.token;

  // 📡 Fetch assigned orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [deliveryBoy, token]);

  // 🔌 Socket.IO setup
  useEffect(() => {
    if (!deliveryBoy?._id) return;
    const s = io(process.env.REACT_APP_BACKEND_URL);
    setSocket(s);
    s.emit('registerDelivery', deliveryBoy._id);
    s.on('newDeliveryAssignment', (payload) => {
      setPendingAssignment(payload);
      setSnackbar({ open: true, message: 'New delivery request!', severity: 'success' });
    });
    return () => s.disconnect();
  }, [deliveryBoy]);

  // ✅ Accept order
  const handleAcceptAssignment = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${pendingAssignment.orderId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(prev => [data.order, ...prev]);
      setPendingAssignment(null);
      setSnackbar({ open: true, message: 'Delivery accepted!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to accept delivery', severity: 'error' });
    }
  };

  // ❌ Reject order
  const handleRejectAssignment = () => {
    setPendingAssignment(null);
    setSnackbar({ open: true, message: 'Delivery rejected', severity: 'warning' });
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdDeliveryDining /> Live Deliveries</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {orders.map(order => (
            <Paper key={order._id} sx={{ mb: 2, p: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
              <Typography variant="subtitle1">Order ID: {order._id}</Typography>
              <Typography><MdLocationOn /> {order.address}</Typography>
              <Typography variant="body2" mt={1}>Items:</Typography>
              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>{item.quantity} x {item.productId?.name || 'N/A'}</li>
                ))}
              </ul>
              <Typography mt={1}>Earnings: ₹{order.totalAmount}</Typography>
              <Button
                variant="contained"
                color="success"
                sx={{ mt: 2 }}
                onClick={() => {
                  // Add delivery completion logic if needed here
                }}
              >
                Mark as Delivered
              </Button>
            </Paper>
          ))}
        </>
      )}

      {/* 📥 Incoming Assignment Modal */}
      <Dialog open={!!pendingAssignment} onClose={() => { }}>
        <DialogTitle>New Delivery Assignment</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2">Shop: {pendingAssignment?.shopDetails?.name}</Typography>
          <Typography variant="body2">Customer Address: {pendingAssignment?.address}</Typography>
          <Typography variant="body2">Earnings: ₹{pendingAssignment?.earnAmount}</Typography>
          <Typography variant="body2" mt={1}>Items:</Typography>
          <ul>
            {pendingAssignment?.items?.map((item, i) => (
              <li key={i}>{item.quantity} x {item.name}</li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectAssignment} color="error">Reject</Button>
          <Button onClick={handleAcceptAssignment} variant="contained" color="primary">Accept</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
