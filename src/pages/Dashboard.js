import React, { useState, useContext } from 'react';
import DashboardLayout from './DashboardLayout';
import OrdersSection from './dashboard/OrdersSection';
import EarningsSection from './dashboard/EarningsSection';
import HistorySection from './dashboard/HistorySection';
import ProfileSection from './dashboard/ProfileSection';
import SupportSection from './dashboard/SupportSection';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { deliveryBoy, logout } = useContext(AuthContext);
  const [currentSection, setCurrentSection] = useState('orders');
  const [darkMode, setDarkMode] = useState(false);

  return (
    <DashboardLayout
      onSectionChange={setCurrentSection}
      currentSection={currentSection}
      onLogout={logout}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      deliveryBoy={deliveryBoy?.deliveryBoy}
    >
      {currentSection === 'orders' && <OrdersSection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />}
      {currentSection === 'earnings' && <EarningsSection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />}
      {currentSection === 'history' && <HistorySection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />}
      {currentSection === 'profile' && <ProfileSection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />}
      {currentSection === 'support' && <SupportSection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />}
    </DashboardLayout>
  );
}
