import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { DeliveryContext } from '../context/DeliveryContext';
import './NotificationHandler.css';

const NotificationHandler = () => {
    const { notifications, removeNotification, requestNotificationPermission } = useContext(SocketContext);
    const { refreshData } = useContext(DeliveryContext);
    const [toastNotifications, setToastNotifications] = useState([]);

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // Handle new notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const latestNotification = notifications[0];

            // Add to toast notifications
            setToastNotifications(prev => [
                {
                    ...latestNotification,
                    toastId: Date.now()
                },
                ...prev.slice(0, 4) // Keep max 5 toast notifications
            ]);

            // Auto-remove toast after 5 seconds
            setTimeout(() => {
                setToastNotifications(prev =>
                    prev.filter(toast => toast.toastId !== latestNotification.toastId)
                );
            }, 5000);

            // Refresh data for certain notification types
            if (['new_order', 'status_update', 'order_cancelled'].includes(latestNotification.type)) {
                refreshData();
            }
        }
    }, [notifications, refreshData]);

    const handleToastClick = (notification) => {
        // Handle different notification types
        switch (notification.type) {
            case 'new_order':
                // Navigate to orders page or show order details
                window.location.href = '/orders';
                break;
            case 'status_update':
                // Navigate to specific order
                if (notification.data?.orderId) {
                    window.location.href = `/orders/${notification.data.orderId}`;
                }
                break;
            default:
                break;
        }

        // Remove from toast
        setToastNotifications(prev =>
            prev.filter(toast => toast.toastId !== notification.toastId)
        );
    };

    const removeToast = (toastId) => {
        setToastNotifications(prev =>
            prev.filter(toast => toast.toastId !== toastId)
        );
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_order':
                return '📦';
            case 'status_update':
                return '📋';
            case 'order_cancelled':
                return '❌';
            case 'earnings':
                return '💰';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'new_order':
                return '#4CAF50';
            case 'status_update':
                return '#2196F3';
            case 'order_cancelled':
                return '#f44336';
            case 'earnings':
                return '#FF9800';
            default:
                return '#9C27B0';
        }
    };

    return (
        <div className="notification-handler">
            {/* Toast Notifications */}
            <div className="toast-container">
                {toastNotifications.map((notification) => (
                    <div
                        key={notification.toastId}
                        className={`toast-notification ${notification.type}`}
                        style={{ borderLeftColor: getNotificationColor(notification.type) }}
                        onClick={() => handleToastClick(notification)}
                    >
                        <div className="toast-icon">
                            {getNotificationIcon(notification.type)}
                        </div>
                        <div className="toast-content">
                            <div className="toast-title">{notification.title}</div>
                            <div className="toast-message">{notification.message}</div>
                        </div>
                        <button
                            className="toast-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeToast(notification.toastId);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationHandler;