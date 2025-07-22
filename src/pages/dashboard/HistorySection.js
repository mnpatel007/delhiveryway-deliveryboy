import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { MdHistory } from 'react-icons/md';

export default function HistorySection({ darkMode, history }) {
  const calculateEarnings = (order) => {
    const itemTotal = order.items.reduce((sum, item) => {
      return sum + item.productId.price * item.quantity;
    }, 0);
    const gst = itemTotal * 0.05;
    const platformFee = itemTotal * 0.029;
    const tax = gst + platformFee;
    const deliveryCharge = order.deliveryCharge || 0;
    const grandTotal = itemTotal + tax + deliveryCharge;
    const earning = grandTotal * 0.1;
    return earning.toFixed(2);
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdHistory /> Delivery History</Typography>
      <TableContainer component={Paper} sx={{ bgcolor: darkMode ? '#23272f' : '#fff' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Your Earnings</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.address}</TableCell>
                <TableCell>₹{calculateEarnings(order)}</TableCell>
                <TableCell>
                  <Chip label={order.status} color="success" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
