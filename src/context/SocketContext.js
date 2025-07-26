import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { DeliveryContext } from './DeliveryContext';

export const SocketContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
    const { isAuthenticated, deliveryBoy } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (isAuthenticated && deliveryBoy) {
            // Initialize socket connection
            const newSocket = io(BACKEND_URL, {
                withCredentials: true,
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('🟢 Socket connected:', newSocket.id);
                setIsConnected(true);

                // Register as delivery boy
                newSocket.emit('registerDelivery', deliveryBoy._id);
                newSocket.emit('authenticate', { userId: deliveryBoy._id });
            });

            newSocket.on('disconnect', () => {
                console.log('🔴 Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setIsConnected(false);
            });

            // Listen for new delivery assignments
            newSocket.on('newDeliveryAssignment', (data) => {
                console.log('📦 New delivery assignment:', data);
                addNotification({
                    id: Date.now(),
                    type: 'new_order',
                    title: 'New Delivery Available!',
                    message: `Order #${data.orderId.slice(-6)} is ready for pickup`,
                    data: data,
                    timestamp: new Date().toISOString()
                });

                // Play notification sound
                playNotificationSound();

                // Show browser notification if permission granted
                showBrowserNotification('New Delivery Available!', `Order #${data.orderId.slice(-6)} is ready for pickup`);
            });

            // Listen for order status updates
            newSocket.on('orderStatusUpdate', (data) => {
                console.log('📋 Order status update:', data);
                addNotification({
                    id: Date.now(),
                    type: 'status_update',
                    title: 'Order Status Updated',
                    message: `Order #${data.orderId.slice(-6)} status: ${data.status}`,
                    data: data,
                    timestamp: new Date().toISOString()
                });
            });

            // Listen for order cancellations
            newSocket.on('orderCancelled', (data) => {
                console.log('❌ Order cancelled:', data);
                addNotification({
                    id: Date.now(),
                    type: 'order_cancelled',
                    title: 'Order Cancelled',
                    message: `Order #${data.orderId.slice(-6)} has been cancelled`,
                    data: data,
                    timestamp: new Date().toISOString()
                });

                playNotificationSound();
                showBrowserNotification('Order Cancelled', `Order #${data.orderId.slice(-6)} has been cancelled`);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        }
    }, [isAuthenticated, deliveryBoy]);

    // Add notification to list
    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    };

    // Remove notification
    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // Clear all notifications
    const clearNotifications = () => {
        setNotifications([]);
    };

    // Play notification sound
    const playNotificationSound = () => {
        try {
            const audio = new Audio('/notification.mp3');
            audio.volume = 0.5;
            audio.play().catch(error => {
                console.log('Could not play notification sound:', error);
            });
        } catch (error) {
            console.log('Notification sound not available:', error);
        }
    };

    // Show browser notification
    const showBrowserNotification = (title, body) => {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon: '/logo192.png',
                    badge: '/logo192.png',
                    tag: 'delivery-notification'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body,
                            icon: '/logo192.png',
                            badge: '/logo192.png',
                            tag: 'delivery-notification'
                        });
                    }
                });
            }
        }
    };

    // Request notification permission
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission;
        }
        return 'denied';
    };

    // Emit events
    const emitEvent = (eventName, data) => {
        if (socket && isConnected) {
            socket.emit(eventName, data);
        }
    };

    // Join specific room
    const joinRoom = (roomName) => {
        if (socket && isConnected) {
            socket.emit('join', roomName);
        }
    };

    // Leave specific room
    const leaveRoom = (roomName) => {
        if (socket && isConnected) {
            socket.emit('leave', roomName);
        }
    };

    const value = {
        socket,
        isConnected,
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        requestNotificationPermission,
        emitEvent,
        joinRoom,
        leaveRoom
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};