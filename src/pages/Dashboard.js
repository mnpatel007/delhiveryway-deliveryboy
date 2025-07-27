import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { DeliveryContext } from '../context/DeliveryContext';
import { LocationContext } from '../context/LocationContext';
import { SocketContext } from '../context/SocketContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const { deliveryBoy, updateOnlineStatus } = useContext(AuthContext);
    const {
        availableOrders,
        activeDeliveries,
        earnings,
        loading,
        error,
        acceptOrder,
        refreshData
    } = useContext(DeliveryContext);
    const { currentLocation, isTracking, startTracking, getDistance } = useContext(LocationContext);
    const { isConnected, notifications } = useContext(SocketContext);

    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Load initial data
    useEffect(() => {
        if (deliveryBoy && !dataLoaded) {
            const loadData = async () => {
                try {
                    await refreshData();
                    setDataLoaded(true);
                } catch (error) {
                    console.error('Failed to load dashboard data:', error);
                }
            };
            loadData();
        }
    }, [deliveryBoy, dataLoaded, refreshData]);

    // Check location permission on mount
    useEffect(() => {
        if (!isTracking && deliveryBoy?.isOnline) {
            setShowLocationPrompt(true);
        }
    }, [isTracking, deliveryBoy?.isOnline]);

    const handleGoOnline = async () => {
        if (!currentLocation && !isTracking) {
            const success = await startTracking();
            if (!success) {
                alert('Location access is required to go online. Please enable location services.');
                return;
            }
        }
        await updateOnlineStatus(true);
    };

    const handleGoOffline = async () => {
        await updateOnlineStatus(false);
    };

    const handleAcceptOrder = async (orderId) => {
        if (!currentLocation) {
            setError('Location is required to accept orders. Please enable location services.');
            return;
        }

        try {
            const result = await acceptOrder(orderId, currentLocation);
            if (result.success) {
                // Show success message and navigate
                setError(null);
                navigate('/orders');
            } else {
                setError(result.message);
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            setError('Failed to accept order. Please try again.');
        }
    };

    const handleEnableLocation = async () => {
        const success = await startTracking();
        if (success) {
            setShowLocationPrompt(false);
        }
    };

    if (loading && !dataLoaded) {
        return <LoadingSpinner message="Loading dashboard..." />;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-container">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1>Welcome back, {deliveryBoy?.name}!</h1>
                        <p>Ready to start delivering?</p>
                    </div>

                    <div className="status-section">
                        <div className="status-indicators">
                            <div className={`status-indicator ${deliveryBoy?.isOnline ? 'online' : 'offline'}`}>
                                <span className="status-dot"></span>
                                <span>{deliveryBoy?.isOnline ? 'Online' : 'Offline'}</span>
                            </div>

                            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                                <span className="status-dot"></span>
                                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>

                            <div className={`status-indicator ${isTracking ? 'tracking' : 'not-tracking'}`}>
                                <span className="status-dot"></span>
                                <span>{isTracking ? 'GPS Active' : 'GPS Inactive'}</span>
                            </div>
                        </div>

                        <div className="online-toggle">
                            {deliveryBoy?.isOnline ? (
                                <button
                                    className="btn btn-danger"
                                    onClick={handleGoOffline}
                                >
                                    Go Offline
                                </button>
                            ) : (
                                <button
                                    className="btn btn-success"
                                    onClick={handleGoOnline}
                                >
                                    Go Online
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location Prompt */}
                {showLocationPrompt && (
                    <div className="location-prompt">
                        <div className="prompt-content">
                            <span className="prompt-icon">📍</span>
                            <div className="prompt-text">
                                <h4>Enable Location Services</h4>
                                <p>Location access is required to receive and deliver orders</p>
                            </div>
                            <div className="prompt-actions">
                                <button
                                    className="btn btn-primary"
                                    onClick={handleEnableLocation}
                                >
                                    Enable Location
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowLocationPrompt(false)}
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="error-banner">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                        <button
                            className="btn btn-sm"
                            onClick={refreshData}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">💰</div>
                        <div className="stat-content">
                            <h3>₹{earnings.todayEarnings}</h3>
                            <p>Today's Earnings</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📦</div>
                        <div className="stat-content">
                            <h3>{earnings.todayDeliveries}</h3>
                            <p>Today's Deliveries</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-content">
                            <h3>{activeDeliveries.length}</h3>
                            <p>Active Orders</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>₹{earnings.weekEarnings}</h3>
                            <p>This Week</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="dashboard-content">
                    {/* Active Deliveries */}
                    {activeDeliveries.length > 0 && (
                        <div className="section">
                            <div className="section-header">
                                <h2>Active Deliveries</h2>
                                <span className="badge">{activeDeliveries.length}</span>
                            </div>
                            <div className="orders-list">
                                {activeDeliveries.map(order => (
                                    <div key={order._id} className="order-card active">
                                        <div className="order-header">
                                            <span className="order-id">#{order._id.slice(-6)}</span>
                                            <span className={`status-badge ${order.status}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="order-details">
                                            <div className="customer-info">
                                                <h4>{order.customer?.name}</h4>
                                                <p>{order.deliveryAddress}</p>
                                            </div>
                                            <div className="order-actions">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => navigate(`/orders/${order._id}`)}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Available Orders */}
                    <div className="section">
                        <div className="section-header">
                            <h2>Available Orders</h2>
                            <span className="badge">{availableOrders.length}</span>
                        </div>

                        {!deliveryBoy?.isOnline ? (
                            <div className="empty-state">
                                <span className="empty-icon">🔴</span>
                                <h3>You're Offline</h3>
                                <p>Go online to start receiving delivery requests</p>
                                <button
                                    className="btn btn-success"
                                    onClick={handleGoOnline}
                                >
                                    Go Online
                                </button>
                            </div>
                        ) : availableOrders.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📦</span>
                                <h3>No Orders Available</h3>
                                <p>New orders will appear here when available</p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {availableOrders.map(order => (
                                    <div key={order._id} className="order-card available">
                                        <div className="order-header">
                                            <span className="order-id">#{order._id.slice(-6)}</span>
                                            <span className="earning">₹30</span>
                                        </div>
                                        <div className="order-details">
                                            <div className="customer-info">
                                                <h4>{order.customer?.name}</h4>
                                                <p>{order.deliveryAddress}</p>
                                                <div className="distance">
                                                    📍 {(() => {
                                                        if (order.distance) return `${order.distance.toFixed(1)} km`;
                                                        if (currentLocation && order.deliveryAddress) {
                                                            // For demo, show a fixed distance since we don't have coordinates
                                                            return `${(Math.random() * 5 + 1).toFixed(1)} km`;
                                                        }
                                                        return 'Distance unavailable';
                                                    })()}
                                                </div>
                                            </div>
                                            <div className="order-actions">
                                                <button
                                                    className="btn btn-success"
                                                    onClick={() => handleAcceptOrder(order._id)}
                                                >
                                                    Accept Order
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Notifications */}
                    {notifications.length > 0 && (
                        <div className="section">
                            <div className="section-header">
                                <h2>Recent Notifications</h2>
                            </div>
                            <div className="notifications-list">
                                {notifications.slice(0, 3).map(notification => (
                                    <div key={notification.id} className="notification-item">
                                        <span className="notification-icon">
                                            {notification.type === 'new_order' ? '📦' :
                                                notification.type === 'order_cancelled' ? '❌' : '📋'}
                                        </span>
                                        <div className="notification-content">
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <span className="notification-time">
                                                {new Date(notification.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}