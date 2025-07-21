import React, { useContext, useEffect, useState, useMemo } from 'react';
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
    FaTimes,
    FaMotorcycle,
    FaClock,
    FaPhone,
    FaUser,
    FaMap
} from 'react-icons/fa';
import { MdDeliveryDining, MdRestaurant } from 'react-icons/md';
import './Dashboard.css';

const Dashboard = () => {
    const { deliveryBoy, logout, isAuthenticated } = useContext(AuthContext);
    const [assigned, setAssigned] = useState(null);
    const [pendingPopup, setPendingPopup] = useState(null);
    const [socket, setSocket] = useState(null);
    const [currentStatus, setCurrentStatus] = useState('available');

    const isAuthenticatedUser = useMemo(() => {
        return isAuthenticated();
    }, [isAuthenticated]);

    useEffect(() => {
        const newSocket = io(process.env.REACT_APP_BACKEND_URL);
        setSocket(newSocket);

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !deliveryBoy) return;

        socket.emit('registerDelivery', deliveryBoy.deliveryBoy._id);

        const handleNewAssignment = (payload) => {
            if (!assigned) {
                setPendingPopup(payload);
            }
        };

        socket.on('newDeliveryAssignment', handleNewAssignment);

        return () => {
            socket.off('newDeliveryAssignment', handleNewAssignment);
        };
    }, [socket, deliveryBoy, assigned]);

    if (!isAuthenticatedUser) {
        return <Navigate to="/login" />;
    }

    const handleAccept = () => {
        setAssigned(pendingPopup);
        setPendingPopup(null);
        setCurrentStatus('on_delivery');
    };

    const handleReject = () => {
        setPendingPopup(null);
    };

    const handleCompleteDelivery = () => {
        setAssigned(null);
        setCurrentStatus('available');
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
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
            </header>

            {/* Status Bar */}
            <div className="status-bar">
                <div className="status-content">
                    <MdDeliveryDining className="status-icon" />
                    <span className="status-text">
                        {currentStatus === 'available' ? 'Available for deliveries' :
                            currentStatus === 'on_delivery' ? 'Currently on delivery' : 'Offline'}
                    </span>
                </div>
                <div className="status-indicator">
                    <div className="indicator-dot"></div>
                    <span>Active</span>
                </div>
            </div>

            {/* Main Content */}
            <main className="dashboard-main">
                {pendingPopup && !assigned && (
                    <div className="delivery-notification">
                        <div className="notification-header">
                            <FaBell className="notification-icon" />
                            <h3>NEW DELIVERY REQUEST</h3>
                        </div>
                        <div className="notification-details">
                            <div className="detail-item">
                                <FaMoneyBillWave className="detail-icon" />
                                <div>
                                    <p className="detail-label">Earnings</p>
                                    <p className="detail-value">₹{pendingPopup.earnAmount}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaMapMarkerAlt className="detail-icon" />
                                <div>
                                    <p className="detail-label">Delivery Address</p>
                                    <p className="detail-value">{pendingPopup.address}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaBox className="detail-icon" />
                                <div>
                                    <p className="detail-label">Items</p>
                                    <p className="detail-value">{pendingPopup.items.length} items</p>
                                </div>
                            </div>
                        </div>
                        <div className="notification-actions">
                            <button className="accept-button" onClick={handleAccept}>
                                <FaCheck /> ACCEPT DELIVERY
                            </button>
                            <button className="reject-button" onClick={handleReject}>
                                <FaTimes /> REJECT
                            </button>
                        </div>
                    </div>
                )}

                {assigned && (
                    <div className="active-delivery">
                        <div className="delivery-header">
                            <MdDeliveryDining className="delivery-icon" />
                            <h3>ACTIVE DELIVERY</h3>
                        </div>
                        <div className="map-placeholder">
                            <FaMap className="map-icon" />
                            <span>Delivery Route Map</span>
                        </div>
                        <div className="delivery-details">
                            <div className="detail-item">
                                <FaMapMarkerAlt className="detail-icon" />
                                <div>
                                    <p className="detail-label">Delivery Address</p>
                                    <p className="detail-value">{assigned.address}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <MdRestaurant className="detail-icon" />
                                <div>
                                    <p className="detail-label">Shop</p>
                                    <p className="detail-value">{assigned.shopDetails?.name}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaUser className="detail-icon" />
                                <div>
                                    <p className="detail-label">Customer Contact</p>
                                    <p className="detail-value">+91 XXXXX XXXXX</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaClock className="detail-icon" />
                                <div>
                                    <p className="detail-label">Estimated Time</p>
                                    <p className="detail-value">15-20 mins</p>
                                </div>
                            </div>
                        </div>
                        <div className="delivery-items">
                            <h4>DELIVERY ITEMS</h4>
                            <div className="items-list">
                                {assigned.items.map((item, i) => (
                                    <div key={i} className="item-card">
                                        <span>Product ID: {item.productId}</span>
                                        <span className="item-quantity">Qty: {item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="complete-button" onClick={handleCompleteDelivery}>
                            <FaCheck /> MARK AS DELIVERED
                        </button>
                    </div>
                )}

                {!assigned && !pendingPopup && (
                    <div className="empty-state">
                        <MdDeliveryDining className="empty-icon" />
                        <h3>No Active Deliveries</h3>
                        <p>You'll be notified when a new delivery request comes in. Stay ready!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;