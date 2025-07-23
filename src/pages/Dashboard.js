import React, { useContext, useState, useCallback } from 'react'; // Added useCallback
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
    const calculateEarningsFromOrders = useCallback((orders) => { // Wrapped in useCallback
        let today = 0, week = 0, month = 0;
        const now = new Date();
        orders.forEach(order => {
            if (order.status !== 'Delivered') return; // Ensure status matches what's set in OrdersSection
            const orderDate = new Date(order.date); // Use 'date' from history entry
            const earning = order.earnings; // Use 'earnings' directly from history entry

            // Today
            if (
                orderDate.getDate() === now.getDate() &&
                orderDate.getMonth() === now.getMonth() &&
                orderDate.getFullYear() === now.getFullYear()
            ) {
                today += earning;
            }
            // Week: last 7 days (rolling window)
            const diffTime = Math.abs(now - orderDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) { // Changed to <= 7 for a 7-day window including today
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
    }, []); // No dependencies, as it only depends on its input 'orders'

    // Fetch delivery history (delivered orders)
    React.useEffect(() => {
        async function fetchHistory() {
            let token = localStorage.getItem('token');
            if (!token && deliveryBoy?.token) token = deliveryBoy.token;
            if (!token) return;
            try {
                const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/assigned`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const delivered = data.filter(order => order.status === 'delivered').map(order => ({
                        id: order._id,
                        date: new Date(order.updatedAt).toISOString().split('T')[0], // Use updatedAt for delivery date
                        address: order.customerLocation?.address || 'N/A', // Use customerLocation address
                        earnings: order.totalAmount * 0.1, // Calculate earnings here
                        status: 'Delivered'
                    }));
                    setHistory(delivered);
                    setEarnings(calculateEarningsFromOrders(delivered));
                } else {
                    console.error('Failed to fetch history:', res.status, res.statusText);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            }
        }
        fetchHistory();
    }, [deliveryBoy, calculateEarningsFromOrders, setHistory, setEarnings]); // Added dependencies

    const handleSectionChange = useCallback((section) => { // Wrapped in useCallback
        setCurrentSection(section);
    }, []);

    const handleSetDarkMode = useCallback((mode) => { // Wrapped in useCallback
        setDarkMode(mode);
    }, []);

    const handleLogout = useCallback(() => { // Wrapped in useCallback
        logout();
    }, [logout]);

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

