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

    // Utility to calculate earnings from orders
    function calculateEarningsFromOrders(orders) {
        let today = 0, week = 0, month = 0;
        const now = new Date();
        orders.forEach(order => {
            if (order.status !== 'delivered') return;
            const orderDate = new Date(order.createdAt);
            const earning = (order.totalAmount * 0.1);
            if (
                orderDate.getDate() === now.getDate() &&
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            ) {
                today += earning;
            }
            // Week: last 7 days
            const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
            if (diffDays < 7) {
                week += earning;
            }
            // Month: this month
            if (
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            ) {
                month += earning;
            }
        });
        return { today, week, month };
    }

    // Fetch delivery history (delivered orders)
    React.useEffect(() => {
        async function fetchHistory() {
            let token = localStorage.getItem('token');
            if (!token && deliveryBoy?.token) token = deliveryBoy.token;
            if (!token) return;
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const delivered = data.filter(order => order.status === 'delivered');
                setHistory(delivered);
                setEarnings(calculateEarningsFromOrders(delivered));
            }
        }
        fetchHistory();
    }, [deliveryBoy]);

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
