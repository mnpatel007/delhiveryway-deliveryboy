import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { MdHistory } from 'react-icons/md';

const mockHistory = [
  { id: 'ORDER123', date: '2024-04-25', earnings: 45, status: 'Delivered', address: '123 Main St' },
  { id: 'ORDER122', date: '2024-04-24', earnings: 38, status: 'Delivered', address: '456 Park Ave' },
  { id: 'ORDER121', date: '2024-04-23', earnings: 52, status: 'Delivered', address: '789 Lake Rd' },
];

export default function HistorySection({ darkMode, deliveryBoy }) {
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
              <TableCell>Earnings</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockHistory.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>₹{row.earnings}</TableCell>
                <TableCell><Chip label={row.status} color="success" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
