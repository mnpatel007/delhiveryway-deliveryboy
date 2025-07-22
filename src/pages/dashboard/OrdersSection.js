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

  // 📦 Fetch assigned orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      if (!token) {
        console.warn('🚫 No token found for delivery boy.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.warn('⚠️ Invalid orders format:', data);
          setOrders([]);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setOrders([]);
        setSnackbar({ open: true, message: 'Failed to load orders', severity: 'error' });
      }
      setLoading(false);
    };

    fetchOrders();
  }, [token, deliveryBoy]);

  // 🔌 Socket.IO: Real-time assignment
  useEffect(() => {
    if (!deliveryBoy?._id || !token) return;

    const s = io(process.env.REACT_APP_BACKEND_URL);
    s.emit('registerDelivery', deliveryBoy._id);
    s.on('newDeliveryAssignment', (payload) => {
      setPendingAssignment(payload);
      setSnackbar({ open: true, message: 'New delivery request received', severity: 'success' });
    });

    setSocket(s);
    return () => s.disconnect();
  }, [deliveryBoy, token]);

  // ✅ Accept Order
  const handleAcceptAssignment = async () => {
    if (!pendingAssignment?.orderId || !token) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${pendingAssignment.orderId}/accept`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) throw new Error('Failed to accept order');
      const data = await res.json();

      setOrders(prev => [data.order, ...prev]);
      setPendingAssignment(null);
      setSnackbar({ open: true, message: 'Order accepted', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Error accepting order', severity: 'error' });
    }
  };

  // ❌ Reject Order
  const handleRejectAssignment = () => {
    setPendingAssignment(null);
    setSnackbar({ open: true, message: 'Delivery rejected', severity: 'info' });
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdDeliveryDining /> Active Deliveries</Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        <Typography variant="body1" color="textSecondary">No active orders.</Typography>
      ) : (
        orders.map((order) => (
          <Paper key={order._id} sx={{ p: 2, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
            <Typography variant="subtitle1">Order ID: {order._id}</Typography>
            <Typography><MdLocationOn /> {order.address}</Typography>
            <Typography variant="body2" mt={1}>Items:</Typography>
            <ul>
              {Array.isArray(order.items) && order.items.map((item, i) => (
                <li key={i}>{item.quantity} x {item.productId?.name || 'N/A'}</li>
              ))}
            </ul>
            <Typography mt={1}>Earnings: ₹{order.totalAmount || 0}</Typography>
            <Button
              variant="contained"
              color="success"
              sx={{ mt: 2 }}
              endIcon={<MdCheckCircle />}
              onClick={() => {
                // Add delivery completion logic here if needed
              }}
            >
              Mark as Delivered
            </Button>
          </Paper>
        ))
      )}

      {/* 📥 Assignment Popup */}
      <Dialog open={!!pendingAssignment} onClose={() => { }}>
        <DialogTitle>New Delivery Request</DialogTitle>
        <DialogContent dividers>
          {pendingAssignment && (
            <>
              <Typography variant="subtitle2">Shop: {pendingAssignment.shopDetails?.name}</Typography>
              <Typography>Customer Address: {pendingAssignment.address}</Typography>
              <Typography>Earnings: ₹{pendingAssignment.earnAmount}</Typography>
              <Typography mt={1}>Items:</Typography>
              <ul>
                {pendingAssignment.items?.map((item, i) => (
                  <li key={i}>{item.quantity} x {item.name}</li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleRejectAssignment}>Reject</Button>
          <Button variant="contained" color="primary" onClick={handleAcceptAssignment}>Accept</Button>
        </DialogActions>
      </Dialog>

      {/* 🔔 Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
