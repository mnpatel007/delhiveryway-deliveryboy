import React, { useContext, useState, useEffect, useCallback } from 'react';
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

    /* ---- earnings & history now come from DeliveryRecord ---- */
    const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
    const [history, setHistory] = useState([]);

    const token = localStorage.getItem('token');

    /* fetch earnings & history from /api/delivery/my-deliveries */
    const fetchStats = useCallback(async () => {
        if (!token) return;
        try {
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/delivery/my-deliveries`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            /* flat ₹30 per delivery */
            const delivered = data.filter(d => d.status === 'delivered');
            setHistory(delivered);

            /* calculate */
            const now = new Date();
            let today = 0, week = 0, month = 0;
            delivered.forEach(d => {
                const ts = new Date(d.deliveredAt);
                if (ts.toDateString() === now.toDateString()) today += 30;
                if ((now - ts) / (1000 * 60 * 60 * 24) <= 7) week += 30;
                if (ts.getMonth() === now.getMonth() && ts.getFullYear() === now.getFullYear()) month += 30;
            });
            setEarnings({ today, week, month });
        } catch (e) {
            console.error(e);
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleSectionChange = useCallback(sec => setCurrentSection(sec), []);
    const handleSetDarkMode = useCallback(mode => setDarkMode(mode), []);
    const handleLogout = useCallback(() => logout(), [logout]);

    return (
        <DashboardLayout
            onSectionChange={handleSectionChange}
            currentSection={currentSection}
            onLogout={handleLogout}
            darkMode={darkMode}
            setDarkMode={handleSetDarkMode}
            deliveryBoy={deliveryBoy?.deliveryBoy}
        >
            {currentSection === 'orders' && (
                <OrdersSection
                    deliveryBoy={deliveryBoy?.deliveryBoy}
                    darkMode={darkMode}
                    onDelivered={fetchStats}
                />
            )}
            {currentSection === 'earnings' && (
                <EarningsSection darkMode={darkMode} earnings={earnings} />
            )}
            {currentSection === 'history' && (
                <HistorySection darkMode={darkMode} history={history} />
            )}
            {currentSection === 'profile' && (
                <ProfileSection darkMode={darkMode} deliveryBoy={deliveryBoy?.deliveryBoy} />
            )}
            {currentSection === 'support' && <SupportSection darkMode={darkMode} />}
        </DashboardLayout>
    );
}