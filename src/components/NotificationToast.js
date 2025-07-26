import React, { useState, useEffect } from 'react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose, onAction }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Animate in
        setTimeout(() => setIsVisible(true), 100);

        // Auto-close after 5 seconds
        const timer = setTimeout(() => {
            handleClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(notification.toastId);
        }, 300);
    };

    const handleAction = () => {
        if (onAction) {
            onAction(notification);
        }
        handleClose();
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'new_order':
                return '📦';
            case 'status_update':
                return '📋';
            case 'order_cancelled':
                return '❌';
            case 'success':
                return '✅';
            case 'error':
                return '⚠️';
            default:
                return '🔔';
        }
    };

    const getActionText = () => {
        switch (notification.type) {
            case 'new_order':
                return 'View Order';
            case 'status_update':
                return 'View Details';
            default:
                return 'View';
        }
    };

    return (
        <div
            className={`notification-toast ${notification.type} ${isVisible ? 'visible' : ''} ${isExiting ? 'exiting' : ''}`}
            onClick={handleAction}
        >
            <div className="toast-content">
                <div className="toast-icon">
                    {getIcon()}
                </div>
                <div className="toast-text">
                    <div className="toast-title">{notification.title}</div>
                    <div className="toast-message">{notification.message}</div>
                </div>
                <button
                    className="toast-close"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                >
                    ×
                </button>
            </div>
            {notification.type === 'new_order' && (
                <div className="toast-action">
                    <span>{getActionText()}</span>
                </div>
            )}
        </div>
    );
};

export default NotificationToast;