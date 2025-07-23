import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { MdDeliveryDining, MdLocationOn, MdCheckCircle, MdEmail, MdPerson } from 'react-icons/md';
import io from 'socket.io-client';

export default function OrdersSection({ darkMode, deliveryBoy, orders, setOrders, setHistory, setEarnings }) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const token = localStorage.getItem('token') || deliveryBoy?.token;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      if (!token) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
      } catch (err) {
        console.error(err);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [token]);

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

      const data = await res.json();
      setOrders(prev => [data.order, ...prev]);
      setPendingAssignment(null);
      setSnackbar({ open: true, message: 'Order accepted', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to accept', severity: 'error' });
    }
  };

  const handleRejectAssignment = () => {
    setPendingAssignment(null);
    setSnackbar({ open: true, message: 'Delivery rejected', severity: 'info' });
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      const delivered = data.order;
      setOrders(prev => prev.filter(o => o._id !== delivered._id));

      // Add to history
      const historyEntry = {
        id: delivered._id,
        date: new Date().toISOString().split('T')[0],
        address: delivered.address,
        earnings: delivered.totalAmount,
        status: 'Delivered'
      };
      setHistory(prev => [historyEntry, ...prev]);

      // Update earnings
      setEarnings(prev => ({
        today: prev.today + delivered.totalAmount,
        week: prev.week + delivered.totalAmount,
        month: prev.month + delivered.totalAmount
      }));

      setSnackbar({ open: true, message: 'Order marked as delivered!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Delivery update failed', severity: 'error' });
    }
  };


  return (
    <Box>
      <Typography variant="h6" mb={2}><MdDeliveryDining /> Active Deliveries</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        orders.map((order) => {
          const shop = order.items[0]?.productId?.shopId;
          return (
            <Paper key={order._id} sx={{ p: 2, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
              <Typography variant="subtitle1">Order ID: {order._id}</Typography>
              <Typography><MdLocationOn /> {order.address}</Typography>
              <Typography><MdPerson /> {order.customerId?.name}</Typography>
              <Typography><MdEmail /> {order.customerId?.email}</Typography>
              <Typography variant="body2">Shop: {shop?.name || 'Unknown'} - {shop?.address || 'N/A'}</Typography>

              <Typography variant="body2" mt={1}>Items:</Typography>
              <ul>
                {Array.isArray(order.items) && order.items.map((item, i) => (
                  <li key={i}>{item.quantity} x {item.productId?.name || 'N/A'}</li>
                ))}
              </ul>

              <Typography mt={1}>
                Your Earnings (10%): ₹{(order.totalAmount * 0.1).toFixed(2)}
              </Typography>

              {order.status === 'out for delivery' && (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, mr: 2 }}
                  endIcon={<MdCheckCircle />}
                  onClick={async () => {
                    try {
                      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${order._id}/pickup`, {
                        method: 'PUT',
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      const data = await res.json();
                      setOrders(prev => prev.map(o => o._id === order._id ? { ...o, status: 'picked up' } : o));
                      setSnackbar({ open: true, message: 'Order marked as picked up!', severity: 'success' });
                    } catch (err) {
                      setSnackbar({ open: true, message: 'Failed to mark as picked up', severity: 'error' });
                    }
                  }}
                >
                  MARK AS PICKED UP
                </Button>
              )}
              {order.status === 'picked up' && (
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mt: 2 }}
                  endIcon={<MdCheckCircle />}
                  onClick={() => handleMarkDelivered(order._id)}
                >
                  MARK AS DELIVERED
                </Button>
              )}
            </Paper>
          );
        })
      )}

      <Dialog open={!!pendingAssignment} onClose={() => { }}>
        <DialogTitle>New Delivery Request</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2">Shop: {pendingAssignment?.shopDetails?.name}</Typography>
          <Typography>Customer Address: {pendingAssignment?.address}</Typography>
          <Typography>Earnings: ₹{pendingAssignment?.earnAmount}</Typography>
          <ul>
            {pendingAssignment?.items?.map((item, i) => (
              <li key={i}>{item.quantity} x {item.name}</li>
            ))}
          </ul>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleRejectAssignment}>Reject</Button>
          <Button variant="contained" color="primary" onClick={handleAcceptAssignment}>Accept</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
