import React from 'react';
import {
  Box, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { MdHistory } from 'react-icons/md';

export default function HistorySection({ darkMode, history }) {
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
            {history.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.address}</TableCell>
                <TableCell>₹{(row.earnings * 0.1).toFixed(2)}</TableCell>
                <TableCell><Chip label={row.status} color="success" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
