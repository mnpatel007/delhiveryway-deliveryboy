import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, Avatar, Divider, Snackbar, Alert } from '@mui/material';
import { MdPerson, MdEdit, MdLock, MdCloudUpload } from 'react-icons/md';

export default function ProfileSection({ darkMode, deliveryBoy }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(deliveryBoy?.name || '');
  const [email] = useState(deliveryBoy?.email || '');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSave = () => {
    setEdit(false);
    setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}><MdPerson /> Profile</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 2, bgcolor: darkMode ? '#23272f' : '#fff' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56, mr: 2 }}>{name.charAt(0).toUpperCase()}</Avatar>
          <Box>
            <Typography variant="subtitle1">{name}</Typography>
            <Typography variant="body2" color="textSecondary">{email}</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth disabled={!edit} sx={{ mb: 2 }} />
        <TextField label="Email" value={email} fullWidth disabled sx={{ mb: 2 }} />
        <Button variant="outlined" startIcon={<MdEdit />} onClick={() => setEdit(!edit)} sx={{ mr: 2 }}>{edit ? 'Cancel' : 'Edit'}</Button>
        {edit && <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>}
        <Divider sx={{ my: 2 }} />
        <Button variant="outlined" startIcon={<MdLock />} sx={{ mr: 2 }}>Change Password</Button>
        <Button variant="outlined" startIcon={<MdCloudUpload />}>Upload KYC</Button>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
