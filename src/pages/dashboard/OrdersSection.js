// ✅ FULLY UPDATED OrdersSection.js — FIX: Missing details on reload
import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
  Box, Typography, Button, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { MdDeliveryDining, MdLocationOn, MdCheckCircle, MdEmail, MdPerson } from 'react-icons/md';
import MapComponent from '../MapComponent';
import io from 'socket.io-client';

export default React.memo(function OrdersSection({ darkMode, deliveryBoy, orders, setOrders, setHistory, setEarnings }) { // Added React.memo
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [mapPhase, setMapPhase] = useState(localStorage.getItem('mapPhase') || null);
  const [directions, setDirections] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  const token = localStorage.getItem('token') || deliveryBoy?.token;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      if (!token) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
        else setOrders([]);
      } catch (err) {
        console.error(err);
        setOrders([]);
        setSnackbar({ open: true, message: 'Failed to fetch orders.', severity: 'error' }); // User feedback
      }
      setLoading(false);
    };
    fetchOrders();
  }, [token, setOrders]); // Added setOrders to dependency array

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

  useEffect(() => {
    const watch = navigator.geolocation.watchPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        console.log('📍 Current Location:', loc);
        setCurrentLocation(loc);
      },
      (err) => {
        console.warn('❌ Geolocation error:', err);
        setSnackbar({ open: true, message: 'Unable to get current location. Please enable location services.', severity: 'warning' }); // User feedback
      },
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  useEffect(() => {
    const restoreOrder = async () => {
      const savedId = localStorage.getItem('activeOrderId');
      if (!savedId || !token) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${savedId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setActiveOrder(data.order);
      } catch (err) {
        console.error('Failed to restore active order', err);
        setSnackbar({ open: true, message: 'Failed to restore active order.', severity: 'error' }); // User feedback
        localStorage.removeItem('activeOrderId'); // Clear invalid saved ID
        localStorage.removeItem('mapPhase'); // Clear invalid map phase
        setMapPhase(null);
      }
    };
    if (!activeOrder && localStorage.getItem('mapPhase')) {
      restoreOrder();
    }
  }, [activeOrder, token]);

  useEffect(() => {
    if (!activeOrder || !currentLocation) return;
    const shopLoc = activeOrder.items[0]?.productId?.shopId?.location;
    const customerLoc = activeOrder.customerLocation;

    const origin = mapPhase === 'toCustomer' ? shopLoc : currentLocation;
    const destination = mapPhase === 'toCustomer' ? customerLoc : shopLoc;

    console.log('🧭 Map Phase:', mapPhase);
    console.log('🧍 Origin:', origin);
    console.log('🏁 Destination:', destination);

    if (!origin || !destination) return;

    const waitUntilReady = () => {
      if (window.google && window.google.maps) {
        const service = new window.google.maps.DirectionsService();
        service.route({
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          console.log('🗺️ Directions Status:', status);
          if (status === 'OK') setDirections(result);
          else setSnackbar({ open: true, message: `Failed to get directions: ${status}`, severity: 'error' }); // User feedback
        });
      } else {
        setTimeout(waitUntilReady, 200);
      }
    };
    waitUntilReady();
  }, [mapPhase, activeOrder, currentLocation]);

  const handleAcceptAssignment = useCallback(async () => { // Added useCallback
    if (!pendingAssignment?.orderId || !token) return;
    let deliveryBoyStartLocation = currentLocation;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${pendingAssignment.orderId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryBoyStartLocation })
      });
      const data = await res.json();
      setOrders(prev => [data.order, ...prev]);
      setActiveOrder(data.order);
      setMapPhase('toShop');
      localStorage.setItem('mapPhase', 'toShop');
      localStorage.setItem('activeOrderId', data.order._id);
      setPendingAssignment(null);
      setSnackbar({ open: true, message: 'Order accepted', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to accept order. Please try again.', severity: 'error' }); // User feedback
    }
  }, [pendingAssignment, token, currentLocation, setOrders]); // Added dependencies

  const handleMarkPickedUp = useCallback(async (orderId) => { // Added useCallback
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/pickup`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      setActiveOrder(data.order);
      setMapPhase('toCustomer');
      localStorage.setItem('mapPhase', 'toCustomer');
      localStorage.setItem('activeOrderId', data.order._id);
      setSnackbar({ open: true, message: 'Order picked up!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to mark as picked up. Please try again.', severity: 'error' }); // User feedback
    }
  }, [token, setOrders]); // Added dependencies

  const handleMarkDelivered = useCallback(async (orderId) => { // Added useCallback
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setMapPhase(null);
      setDirections(null);
      setActiveOrder(null);
      localStorage.removeItem('mapPhase');
      localStorage.removeItem('activeOrderId');

      const historyEntry = {
        id: data.order._id,
        date: new Date().toISOString().split('T')[0],
        address: data.order.address,
        earnings: data.order.totalAmount,
        status: 'Delivered'
      };
      setHistory(prev => [historyEntry, ...prev]);
      setEarnings(prev => ({
        today: prev.today + (data.order.totalAmount * 0.1), // Earnings calculation moved here for consistency
        week: prev.week + (data.order.totalAmount * 0.1),
        month: prev.month + (data.order.totalAmount * 0.1)
      }));
      setSnackbar({ open: true, message: 'Order delivered!', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to deliver order. Please try again.', severity: 'error' }); // User feedback
    }
  }, [token, setOrders, setHistory, setEarnings]); // Added dependencies

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdDeliveryDining /> Active Deliveries</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        orders.length > 0 ? ( // Added check for empty orders
          orders.map((order) => {
            const shop = order.items[0]?.productId?.shopId;
            return (
              <Paper key={order._id} sx={{ p: 2, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
                <Typography variant="subtitle1">Order ID: {order._id}</Typography>
                <Typography><MdLocationOn /> {order.address}</Typography>
                <Typography><MdPerson /> {order.customerId?.name || 'N/A'}</Typography>
                <Typography><MdEmail /> {order.customerId?.email || 'N/A'}</Typography>
                <Typography variant="body2">Shop: {shop?.name || 'Unknown'} - {shop?.address || 'N/A'}</Typography>
                <ul>
                  {Array.isArray(order.items) && order.items.map((item, i) => (
                    <li key={i}>{item.quantity} x {item.productId?.name || 'N/A'}</li>
                  ))}
                </ul>
                <Typography mt={1}>Your Earnings (10%): ₹{(order.totalAmount * 0.1).toFixed(2)}</Typography>
                {order.status === 'out for delivery' && (
                  <Button onClick={() => handleMarkPickedUp(order._id)} variant="contained" color="primary" sx={{ mt: 2 }}>Mark as Picked Up</Button>
                )}
                {order.status === 'picked up' && (
                  <Button onClick={() => handleMarkDelivered(order._id)} variant="contained" color="success" sx={{ mt: 2 }}>Mark as Delivered</Button>
                )}
              </Paper>
            );
          })
        ) : (
          <Paper sx={{ p: 2, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff', textAlign: 'center' }}>
            <Typography variant="subtitle1" color="textSecondary" sx={{ py: 4 }}>
              No active deliveries at the moment.
            </Typography>
          </Paper>
        )
      )}

      {mapPhase && activeOrder && (
        <Box sx={{ mt: 2 }}>
          <MapComponent
            shopLocation={activeOrder.items[0]?.productId?.shopId?.location}
            deliveryLocation={activeOrder.customerLocation}
            currentLocation={currentLocation}
          />
        </Box>
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
          <Button color="error" onClick={() => setPendingAssignment(null)}>Reject</Button>
          <Button variant="contained" color="primary" onClick={handleAcceptAssignment}>Accept</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}); // Added React.memo

