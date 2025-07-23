// ✅ FULLY UPDATED OrdersSection.js — FIX: Missing details on reload, Map issues
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, Snackbar, Alert, CircularProgress
} from '@mui/material';
import { MdDeliveryDining, MdLocationOn, MdCheckCircle, MdEmail, MdPerson } from 'react-icons/md';
import MapComponent from '../MapComponent';
import io from 'socket.io-client';

export default React.memo(function OrdersSection({ darkMode, deliveryBoy, orders, setOrders, setHistory, setEarnings }) {
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [mapPhase, setMapPhase] = useState(localStorage.getItem('mapPhase') || null);
  const [directions, setDirections] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  const token = localStorage.getItem('token') || deliveryBoy?.token;

  // Helper to safely get nested location
  const getShopLocation = (order) => order?.items?.[0]?.productId?.shopId?.location;
  const getCustomerLocation = (order) => order?.customerLocation;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          // Check if there's an active order from localStorage and set it
          const savedActiveOrderId = localStorage.getItem('activeOrderId');
          const foundActiveOrder = data.find(order => order._id === savedActiveOrderId);
          if (foundActiveOrder) {
            setActiveOrder(foundActiveOrder);
            setMapPhase(localStorage.getItem('mapPhase')); // Restore map phase
          }
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setOrders([]);
        setSnackbar({ open: true, message: 'Failed to fetch orders.', severity: 'error' });
      }
      setLoading(false);
    };
    fetchOrders();
  }, [token, setOrders]);

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
        setSnackbar({ open: true, message: 'Unable to get current location. Please enable location services.', severity: 'warning' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Added timeout and maximumAge
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, []);

  // Effect to calculate directions when mapPhase, activeOrder, or currentLocation changes
  useEffect(() => {
    if (!activeOrder || !currentLocation || !window.google?.maps?.DirectionsService) return;

    const shopLoc = getShopLocation(activeOrder);
    const customerLoc = getCustomerLocation(activeOrder);

    let origin = null;
    let destination = null;

    if (mapPhase === 'toShop') {
      origin = currentLocation;
      destination = shopLoc;
    } else if (mapPhase === 'toCustomer') {
      origin = currentLocation; // Driver is at shop, going to customer
      destination = customerLoc;
    }

    console.log('🧭 Map Phase:', mapPhase);
    console.log('🧍 Origin:', origin);
    console.log('🏁 Destination:', destination);

    if (!origin || !destination) {
      console.warn("Cannot calculate directions: Missing origin or destination.", { origin, destination });
      setDirections(null);
      return;
    }

    const service = new window.google.maps.DirectionsService();
    service.route({
      origin: origin,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING
    }, (result, status) => {
      console.log('🗺️ Directions Status:', status);
      if (status === 'OK') {
        setDirections(result);
      } else {
        setSnackbar({ open: true, message: `Failed to get directions: ${status}`, severity: 'error' });
        setDirections(null);
      }
    });
  }, [mapPhase, activeOrder, currentLocation]);


  const handleAcceptAssignment = useCallback(async () => {
    if (!pendingAssignment?.orderId || !token) return;
    let deliveryBoyStartLocation = currentLocation;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${pendingAssignment.orderId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryBoyStartLocation })
      });
      const data = await res.json();
      if (data.order) {
        setOrders(prev => [data.order, ...prev.filter(o => o._id !== data.order._id)]); // Ensure no duplicates
        setActiveOrder(data.order);
        setMapPhase('toShop');
        localStorage.setItem('mapPhase', 'toShop');
        localStorage.setItem('activeOrderId', data.order._id);
        setPendingAssignment(null);
        setSnackbar({ open: true, message: 'Order accepted', severity: 'success' });
      } else {
        throw new Error("Order data not returned after acceptance.");
      }
    } catch (err) {
      console.error("Failed to accept order:", err);
      setSnackbar({ open: true, message: 'Failed to accept order. Please try again.', severity: 'error' });
    }
  }, [pendingAssignment, token, currentLocation, setOrders]);

  const handleMarkPickedUp = useCallback(async (orderId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/pickup`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.order) {
        setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
        setActiveOrder(data.order);
        setMapPhase('toCustomer');
        localStorage.setItem('mapPhase', 'toCustomer');
        localStorage.setItem('activeOrderId', data.order._id);
        setSnackbar({ open: true, message: 'Order picked up!', severity: 'success' });
      } else {
        throw new Error("Order data not returned after pickup.");
      }
    } catch (err) {
      console.error("Failed to mark as picked up:", err);
      setSnackbar({ open: true, message: 'Failed to mark as picked up. Please try again.', severity: 'error' });
    }
  }, [token, setOrders]);

  const handleMarkDelivered = useCallback(async (orderId) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${orderId}/complete`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.order) {
        setOrders(prev => prev.filter(o => o._id !== orderId));
        setMapPhase(null);
        setDirections(null);
        setActiveOrder(null);
        localStorage.removeItem('mapPhase');
        localStorage.removeItem('activeOrderId');

        const historyEntry = {
          id: data.order._id,
          date: new Date().toISOString().split('T')[0],
          address: data.order.customerLocation?.address || 'N/A', // Use customerLocation address
          earnings: data.order.totalAmount * 0.1, // Consistent earnings calculation
          status: 'Delivered'
        };
        setHistory(prev => [historyEntry, ...prev]);
        setEarnings(prev => ({
          today: prev.today + historyEntry.earnings,
          week: prev.week + historyEntry.earnings,
          month: prev.month + historyEntry.earnings
        }));
        setSnackbar({ open: true, message: 'Order delivered!', severity: 'success' });
      } else {
        throw new Error("Order data not returned after completion.");
      }
    } catch (err) {
      console.error("Failed to deliver order:", err);
      setSnackbar({ open: true, message: 'Failed to deliver order. Please try again.', severity: 'error' });
    }
  }, [token, setOrders, setHistory, setEarnings]);

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdDeliveryDining /> Active Deliveries</Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        orders.length > 0 ? (
          orders.map((order) => {
            const shop = order.items[0]?.productId?.shopId;
            return (
              <Paper key={order._id} sx={{ p: 2, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
                <Typography variant="subtitle1">Order ID: {order._id}</Typography>
                <Typography><MdLocationOn /> {order.address || 'N/A'}</Typography>
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

      {mapPhase && activeOrder && getShopLocation(activeOrder) && getCustomerLocation(activeOrder) && currentLocation && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" mb={2}>Delivery Route</Typography>
          <MapComponent
            shopLocation={getShopLocation(activeOrder)}
            deliveryLocation={getCustomerLocation(activeOrder)}
            currentLocation={currentLocation}
            directions={directions} // Pass directions to MapComponent
            mapPhase={mapPhase} // Pass mapPhase to MapComponent
          />
        </Box>
      )}

      <Dialog open={!!pendingAssignment} onClose={() => { }}>
        <DialogTitle>New Delivery Request</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2">Shop: {pendingAssignment?.shopDetails?.name || 'N/A'}</Typography>
          <Typography>Customer Address: {pendingAssignment?.address || 'N/A'}</Typography>
          <Typography>Earnings: ₹{pendingAssignment?.earnAmount ? pendingAssignment.earnAmount.toFixed(2) : '0.00'}</Typography>
          <ul>
            {Array.isArray(pendingAssignment?.items) && pendingAssignment.items.map((item, i) => (
              <li key={i}>{item.quantity} x {item.name || 'N/A'}</li>
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
});
