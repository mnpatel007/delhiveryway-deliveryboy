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

    // Check authentication first
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    // Always call hooks unconditionally
    useEffect(() => {
        // Create socket connection
        const newSocket = io(process.env.REACT_APP_BACKEND_URL);
        setSocket(newSocket);

        // Cleanup socket on component unmount
        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []); // Empty dependency array

    useEffect(() => {
        // Only proceed if socket and deliveryBoy exist
        if (!socket || !deliveryBoy) return;

        // Register delivery boy
        socket.emit('registerDelivery', deliveryBoy.deliveryBoy._id);

        // Listen for new delivery assignments
        const handleNewAssignment = (payload) => {
            if (!assigned) {
                setPendingPopup(payload);
            }
        };

        socket.on('newDeliveryAssignment', handleNewAssignment);

        // Cleanup
        return () => {
            socket.off('newDeliveryAssignment', handleNewAssignment);
        };
    }, [socket, deliveryBoy, assigned]); // Add all dependencies

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

            {pendingPopup && !assigned && (
                <div className="delivery-notification">
                    <div className="notification-header">
                        <FaBell className="notification-icon" />
                        <h3>New Delivery Assignment</h3>
                    </div>
                    <div className="notification-details">
                        <div className="notification-item">
                            <FaMoneyBillWave />
                            <span>Earn: ₹{pendingPopup.earnAmount}</span>
                        </div>
                        <div className="notification-item">
                            <FaMapMarkerAlt />
                            <span>Destination: {pendingPopup.address}</span>
                        </div>
                        <div className="notification-item">
                            <FaBox />
                            <span>Items: {pendingPopup.items.length}</span>
                        </div>
                    </div>
                    <div className="notification-actions">
                        <button
                            className="btn-accept"
                            onClick={handleAccept}
                        >
                            <FaCheck /> Accept
                        </button>
                        <button
                            className="btn-reject"
                            onClick={handleReject}
                        >
                            <FaTimes /> Reject
                        </button>
                    </div>
                </div>
            )}

            {assigned && (
                <div className="active-delivery-card">
                    <div className="delivery-header">
                        <FaBox className="delivery-icon" />
                        <h3>Active Delivery</h3>
                    </div>
                    <div className="delivery-details">
                        <div className="delivery-detail">
                            <FaMapMarkerAlt />
                            <div>
                                <strong>Delivery Address</strong>
                                <p>{assigned.address}</p>
                            </div>
                        </div>
                        <div className="delivery-detail">
                            <FaBox />
                            <div>
                                <strong>Shop</strong>
                                <p>{assigned.shopDetails?.name}</p>
                            </div>
                        </div>
                        <div className="delivery-detail">
                            <FaMoneyBillWave />
                            <div>
                                <strong>Earnings</strong>
                                <p>₹{assigned.earnAmount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="delivery-items">
                        <h4>Delivery Items</h4>
                        <ul>
                            {assigned.items.map((item, i) => (
                                <li key={i}>
                                    <span>Product ID: {item.productId}</span>
                                    <span>Quantity: {item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;