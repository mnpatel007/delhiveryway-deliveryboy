import React, { useContext, useState } from 'react';
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

    const [orders, setOrders] = useState([]);
    const [history, setHistory] = useState([]);
    const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });

    return (
        <DashboardLayout
            onSectionChange={setCurrentSection}
            currentSection={currentSection}
            onLogout={logout}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            deliveryBoy={deliveryBoy?.deliveryBoy}
        >
            {currentSection === 'orders' && (
                <OrdersSection
                    deliveryBoy={deliveryBoy?.deliveryBoy}
                    darkMode={darkMode}
                    orders={orders}
                    setOrders={setOrders}
                    setHistory={setHistory}
                    setEarnings={setEarnings}
                />
            )}
            {currentSection === 'earnings' && (
                <EarningsSection darkMode={darkMode} earnings={earnings} />
            )}
            {currentSection === 'history' && (
                <HistorySection darkMode={darkMode} history={history} />
            )}
            {currentSection === 'profile' && <ProfileSection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />}
            {currentSection === 'support' && <SupportSection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />}
        </DashboardLayout>
    );
}
