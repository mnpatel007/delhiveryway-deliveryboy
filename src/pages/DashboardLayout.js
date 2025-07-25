import React from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Avatar, Switch } from '@mui/material';
import { MdDeliveryDining, MdHistory, MdAttachMoney, MdPerson, MdHelp, MdLogout, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useState } from 'react';
import '../styles/glass.css';

const drawerWidth = 240;

const navItems = [
  { label: 'Orders', icon: <MdDeliveryDining />, key: 'orders' },
  { label: 'Earnings', icon: <MdAttachMoney />, key: 'earnings' },
  { label: 'History', icon: <MdHistory />, key: 'history' },
  { label: 'Profile', icon: <MdPerson />, key: 'profile' },
  { label: 'Support', icon: <MdHelp />, key: 'support' },
];

export default function DashboardLayout({ children, onSectionChange, currentSection, onLogout, darkMode, setDarkMode, deliveryBoy }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: darkMode ? '#181818' : '#f4f6fa' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: darkMode ? '#23272f' : '#1976d2' }}>
        <Toolbar>
          <Avatar sx={{ mr: 2, bgcolor: '#ff9800' }}>{deliveryBoy?.name?.charAt(0).toUpperCase() || '?'}</Avatar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Delivery Dashboard
          </Typography>
          <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <MdLightMode /> : <MdDarkMode />}
          </IconButton>
          <IconButton color="inherit" onClick={onLogout} sx={{ ml: 1 }}>
            <MdLogout />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: darkMode ? '#23272f' : '#fff' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {navItems.map((item) => (
              <ListItem button key={item.key} selected={currentSection === item.key} onClick={() => onSectionChange(item.key)}>
                <ListItemIcon sx={{ color: currentSection === item.key ? '#1976d2' : (darkMode ? '#fff' : '#23272f') }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px`, bgcolor: darkMode ? '#181818' : '#f4f6fa' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

