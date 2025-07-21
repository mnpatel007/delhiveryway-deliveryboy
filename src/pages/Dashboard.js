import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
    FaBox,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaSignOutAlt,
    FaBell,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
    const { deliveryBoy, logout, isAuthenticated } = useContext(AuthContext);
    const [assigned, setAssigned] = useState(null);
    const [pendingPopup, setPendingPopup] = useState(null);
    const [socket, setSocket] = useState(null);

    // Redirect if not authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        // Create socket connection
        const newSocket = io(process.env.REACT_APP_BACKEND_URL);
        setSocket(newSocket);

        // Cleanup socket on component unmount
        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !deliveryBoy) return;

        // Register delivery boy
        socket.emit('registerDelivery', deliveryBoy.deliveryBoy._id);

        // Listen for new delivery assignments
        socket.on('newDeliveryAssignment', (payload) => {
            if (!assigned) {
                setPendingPopup(payload);
            }
        });

        // Cleanup
        return () => {
            socket.off('newDeliveryAssignment');
        };
    }, [socket, deliveryBoy, assigned]);

    const handleAccept = () => {
        setAssigned(pendingPopup);
        setPendingPopup(null);
    };

    const handleReject = () => {
        setPendingPopup(null);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="profile-section">
                    <div className="profile-avatar">
                        {deliveryBoy?.deliveryBoy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h2>Welcome, {deliveryBoy?.deliveryBoy?.name}</h2>
                        <p>Delivery Partner</p>
                    </div>
                </div>
                <button className="logout-button" onClick={logout}>
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            {/* Rest of the dashboard content remains the same as in previous example */}
            {pendingPopup && !assigned && (
                <div className="delivery-notification">
                    {/* Notification content */}
                </div>
            )}

            {assigned && (
                <div className="active-delivery-card">
                    {/* Active delivery content */}
                </div>
            )}
        </div>
    );
};

export default Dashboard;