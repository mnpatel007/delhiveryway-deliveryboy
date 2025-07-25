import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { MdHistory } from 'react-icons/md';

export default React.memo(function HistorySection({ darkMode, history }) {
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
              <TableCell>Earning</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.length ? (
              history.map(row => (
                <TableRow key={row._id}>
                  <TableCell>{row.orderId._id}</TableCell>
                  <TableCell>{new Date(row.deliveredAt).toLocaleDateString()}</TableCell>
                  <TableCell>{row.customerLocation.address}</TableCell>
                  <TableCell>₹30.00</TableCell>
                  <TableCell><Chip label="Delivered" color="success" /></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography sx={{ py: 4 }} color="textSecondary">No history yet</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
});