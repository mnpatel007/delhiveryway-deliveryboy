import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { MdDeliveryDining, MdLocationOn, MdPerson, MdEmail } from 'react-icons/md';
import MapComponent from '../MapComponent';
import io from 'socket.io-client';

export default React.memo(function OrdersSection({ darkMode, deliveryBoy, onDelivered }) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem('token');

  /* helpers */
  const getShopLocation = o => o.shopLocation;
  const getCustomerLocation = o => o.customerLocation;

  /* fetch assigned */
  const fetchAssigned = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/delivery/my-deliveries`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setOrders(data.filter(d => !['delivered', 'cancelled'].includes(d.status)));
    setLoading(false);
  }, [token]);

  /* socket */
  useEffect(() => {
    if (!deliveryBoy?._id) return;
    const s = io(process.env.REACT_APP_BACKEND_URL);
    s.emit('registerDelivery', deliveryBoy._id);
    s.on('newDeliveryAssignment', p => {
      setPendingAssignment(p);
      setSnackbar({ open: true, message: 'New delivery request', severity: 'success' });
    });
    setSocket(s);
    return () => s.disconnect();
  }, [deliveryBoy]);

  useEffect(() => { fetchAssigned(); }, [fetchAssigned]);

  /* accept */
  const handleAccept = useCallback(async () => {
    if (!pendingAssignment || !token) return;

    // safe destructuring with fallbacks
    const shopLoc = pendingAssignment.shopDetails?.location || {};
    const custLoc = pendingAssignment.customerLocation || {};

    try {
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/delivery/accept/${pendingAssignment.orderId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            customerId: pendingAssignment.customerId,
            shopLocation: {
              address: pendingAssignment.shopDetails?.address || 'Unknown',
              lat: shopLoc.lat || 0,
              lng: shopLoc.lng || 0
            },
            customerLocation: {
              address: custLoc.address || pendingAssignment.address || 'Unknown',
              lat: custLoc.lat || 0,
              lng: custLoc.lng || 0
            }
          })
        }
      );

      setPendingAssignment(null);
      fetchAssigned();
      setSnackbar({ open: true, message: 'Order accepted', severity: 'success' });
    } catch (err) {
      console.error('Accept failed', err);
      setSnackbar({ open: true, message: 'Failed to accept', severity: 'error' });
    }
  }, [pendingAssignment, token, fetchAssigned]);


  /* pick-up */
  const handlePickup = async orderId => {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/delivery/pickup/${orderId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAssigned();
  };

  /* deliver */
  const handleDeliver = async orderId => {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/delivery/deliver/${orderId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchAssigned();
    onDelivered();
    setSnackbar({ open: true, message: 'Marked delivered ₹30 added', severity: 'success' });
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdDeliveryDining /> Active Deliveries</Typography>

      {loading ? <CircularProgress /> : orders.length ? (
        orders.map(o => (
          <Paper key={o._id} sx={{ p: 2, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
            <Typography>Order ID: {o.orderId._id}</Typography>
            <Typography><MdLocationOn /> {o.customerLocation.address}</Typography>
            <Typography><MdPerson /> {o.customerId.name}</Typography>
            <Typography><MdEmail /> {o.customerId.email}</Typography>
            {o.status === 'accepted' && (
              <>
                <Typography sx={{ color: 'orange', fontWeight: 500, mb: 1 }}>Status: Assigned Delivery Driver</Typography>
                <Button onClick={() => handlePickup(o.orderId._id)} variant="contained" sx={{ mt: 1 }}>Mark Picked Up</Button>
              </>
            )}
            {o.status === 'pickedUp' && (
              <>
                <Typography sx={{ color: 'green', fontWeight: 500, mb: 1 }}>Status: Picked Up</Typography>
                <Button onClick={() => handleDeliver(o.orderId._id)} variant="contained" color="success" sx={{ mt: 1 }}>Mark Delivered</Button>
              </>
            )}
          </Paper>
        ))
      ) : (
        <Paper sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          No active deliveries
        </Paper>
      )}

      <Dialog open={!!pendingAssignment} onClose={() => { }}>
        <DialogTitle>New Delivery Request</DialogTitle>
        <DialogContent dividers>
          <Typography>Shop: {pendingAssignment?.shopDetails?.name}</Typography>
          <Typography>Address: {pendingAssignment?.address}</Typography>
          <Typography>Earnings: ₹30</Typography>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setPendingAssignment(null)}>Reject</Button>
          <Button variant="contained" onClick={handleAccept}>Accept</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
});