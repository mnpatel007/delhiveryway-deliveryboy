import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { LocationContext } from '../context/LocationContext';
import './Navbar.css';

const Navbar = () => {
    const { deliveryBoy, logout, updateOnlineStatus } = useContext(AuthContext);
    const { isConnected, notifications } = useContext(SocketContext);
    const { isTracking, currentLocation } = useContext(LocationContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleOnlineStatus = async () => {
        const newStatus = !deliveryBoy?.isOnline;
        await updateOnlineStatus(newStatus);
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo and Brand */}
                <div className="navbar-brand">
                    <Link to="/dashboard" className="brand-link">
                        <span className="brand-icon">🚚</span>
                        <span className="brand-text">DeliveryWay</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className="navbar-nav">
                    <Link
                        to="/dashboard"
                        className={`nav-link ${isActiveRoute('/dashboard') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🏠</span>
                        <span className="nav-text">Dashboard</span>
                    </Link>

                    <Link
                        to="/orders"
                        className={`nav-link ${isActiveRoute('/orders') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">📦</span>
                        <span className="nav-text">Orders</span>
                    </Link>

                    <Link
                        to="/map"
                        className={`nav-link ${isActiveRoute('/map') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">🗺️</span>
                        <span className="nav-text">Map</span>
                    </Link>

                    <Link
                        to="/earnings"
                        className={`nav-link ${isActiveRoute('/earnings') ? 'active' : ''}`}
                    >
                        <span className="nav-icon">💰</span>
                        <span className="nav-text">Earnings</span>
                    </Link>
                </div>

                {/* Status Indicators and Actions */}
                <div className="navbar-actions">
                    {/* Online Status Toggle */}
                    <button
                        className={`status-toggle ${deliveryBoy?.isOnline ? 'online' : 'offline'}`}
                        onClick={toggleOnlineStatus}
                        title={deliveryBoy?.isOnline ? 'Go Offline' : 'Go Online'}
                    >
                        <span className="status-indicator"></span>
                        <span className="status-text">
                            {deliveryBoy?.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </button>

                    {/* Connection Status */}
                    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                        <span className="connection-indicator"></span>
                        <span className="connection-text">
                            {isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>

                    {/* Location Status */}
                    <div className={`location-status ${isTracking ? 'tracking' : 'not-tracking'}`}>
                        <span className="location-icon">📍</span>
                        <span className="location-text">
                            {isTracking ? 'GPS Active' : 'GPS Inactive'}
                        </span>
                    </div>

                    {/* Notifications */}
                    <div className="notifications-container">
                        <button
                            className="notifications-button"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <span className="notification-icon">🔔</span>
                            {unreadNotifications > 0 && (
                                <span className="notification-badge">{unreadNotifications}</span>
                            )}
                        </button>

                        {showNotifications && (
                            <div className="notifications-dropdown">
                                <div className="notifications-header">
                                    <h4>Notifications</h4>
                                    <button
                                        className="close-notifications"
                                        onClick={() => setShowNotifications(false)}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div className="notifications-list">
                                    {notifications.length === 0 ? (
                                        <div className="no-notifications">No notifications</div>
                                    ) : (
                                        notifications.slice(0, 5).map(notification => (
                                            <div key={notification.id} className="notification-item">
                                                <div className="notification-title">{notification.title}</div>
                                                <div className="notification-message">{notification.message}</div>
                                                <div className="notification-time">
                                                    {new Date(notification.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Menu */}
                    <div className="profile-container">
                        <button
                            className="profile-button"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            <span className="profile-icon">👤</span>
                            <span className="profile-name">{deliveryBoy?.name}</span>
                            <span className="dropdown-arrow">▼</span>
                        </button>

                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <Link
                                    to="/profile"
                                    className="profile-menu-item"
                                    onClick={() => setShowProfileMenu(false)}
                                >
                                    <span className="menu-icon">⚙️</span>
                                    Profile Settings
                                </Link>
                                <button
                                    className="profile-menu-item logout-button"
                                    onClick={handleLogout}
                                >
                                    <span className="menu-icon">🚪</span>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;