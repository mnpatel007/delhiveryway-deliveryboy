import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { DeliveryContext } from '../context/DeliveryContext';
import NotificationToast from './NotificationToast';
import './NotificationHandler.css';

const NotificationHandler = () => {
    const { notifications, requestNotificationPermission } = useContext(SocketContext);
    const { refreshData } = useContext(DeliveryContext);
    const [toastNotifications, setToastNotifications] = useState([]);
    const [processedNotifications, setProcessedNotifications] = useState(new Set());

    // Request notification permission on mount
    useEffect(() => {
        requestNotificationPermission();
    }, [requestNotificationPermission]);

    // Handle new notifications with better deduplication
    useEffect(() => {
        if (notifications.length > 0) {
            notifications.forEach(notification => {
                const notificationKey = `${notification.id}_${notification.message}_${notification.title}`;

                // Skip if already processed
                if (processedNotifications.has(notificationKey)) {
                    return;
                }

                // Mark as processed
                setProcessedNotifications(prev => new Set([...prev, notificationKey]));

                const toastId = `toast_${Date.now()}_${Math.random()}`;

                // Add to toast notifications
                setToastNotifications(prev => [
                    {
                        ...notification,
                        toastId
                    },
                    ...prev.slice(0, 4) // Keep max 5 toast notifications
                ]);

                // Auto-remove toast after 5 seconds
                setTimeout(() => {
                    setToastNotifications(prev =>
                        prev.filter(toast => toast.toastId !== toastId)
                    );
                }, 5000);

                // Refresh data for certain notification types (with debounce)
                if (['new_order', 'status_update', 'order_cancelled'].includes(notification.type)) {
                    // Debounce refresh to prevent excessive calls
                    setTimeout(() => {
                        refreshData();
                    }, 1000);
                }
            });
        }
    }, [notifications, refreshData, processedNotifications]);

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



    return (
        <div className="notification-handler">
            {/* Toast Notifications */}
            <div className="toast-container">
                {toastNotifications.map((notification) => (
                    <NotificationToast
                        key={notification.toastId}
                        notification={notification}
                        onClose={removeToast}
                        onAction={handleToastClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default NotificationHandler;