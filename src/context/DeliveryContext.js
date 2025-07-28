import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { mockAvailableOrders, mockActiveDeliveries, mockEarnings } from '../utils/mockData';

export const DeliveryContext = createContext();

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const DeliveryProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [deliveryHistory, setDeliveryHistory] = useState([]);
    const [earnings, setEarnings] = useState({
        today: 0,
        week: 0,
        month: 0,
        total: 0,
        todayDeliveries: 0,
        totalDeliveries: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch available orders
    const fetchAvailableOrders = async (retryCount = 0) => {
        if (!isAuthenticated) return;

        // Use mock data if enabled
        if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
            setAvailableOrders(mockAvailableOrders);
            setError(null);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/delivery/available-orders`);
            setAvailableOrders(response.data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch available orders:', error);

            // Retry up to 2 times for network errors
            if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || error.response?.status >= 500)) {
                setTimeout(() => fetchAvailableOrders(retryCount + 1), 1000 * (retryCount + 1));
                return;
            }

            // Fallback to mock data on error
            console.log('Using fallback mock data for available orders');
            setAvailableOrders(mockAvailableOrders);
            setError('Using offline data - some features may be limited');
        } finally {
            setLoading(false);
        }
    };

    // Fetch active deliveries
    const fetchActiveDeliveries = async (retryCount = 0) => {
        if (!isAuthenticated) return;

        // Use mock data if enabled
        if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
            setActiveDeliveries(mockActiveDeliveries);
            setError(null);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/delivery/active-deliveries`);
            setActiveDeliveries(response.data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch active deliveries:', error);

            // Retry for network errors
            if (retryCount < 2 && (error.code === 'NETWORK_ERROR' || error.response?.status >= 500)) {
                setTimeout(() => fetchActiveDeliveries(retryCount + 1), 1000 * (retryCount + 1));
                return;
            }

            // Fallback to mock data
            console.log('Using fallback mock data for active deliveries');
            setActiveDeliveries(mockActiveDeliveries);
            setError('Using offline data - some features may be limited');
        }
    };

    // Fetch delivery history
    const fetchDeliveryHistory = async (page = 1, limit = 10) => {
        if (!isAuthenticated) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/api/delivery/my-deliveries?page=${page}&limit=${limit}`);
            setDeliveryHistory(response.data.records);
            setError(null);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch delivery history:', error);
            setError('Failed to fetch delivery history');
        }
    };

    // Fetch earnings
    const fetchEarnings = async () => {
        if (!isAuthenticated) return;

        // Use mock data if enabled
        if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
            setEarnings(mockEarnings);
            setError(null);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/delivery/earnings`);
            setEarnings(response.data);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch earnings:', error);

            // Fallback to mock data
            console.log('Using fallback mock data for earnings');
            setEarnings(mockEarnings);
            setError('Using offline data - some features may be limited');
        }
    };

    // Accept order
    const acceptOrder = async (orderId, currentLocation) => {
        try {
            setLoading(true);
            setError(null);

            if (!currentLocation) {
                throw new Error('Location is required to accept orders');
            }

            const response = await axios.post(`${API_BASE_URL}/api/delivery/accept/${orderId}`, {
                currentLocation
            });

            // Refresh data
            await Promise.all([
                fetchAvailableOrders(),
                fetchActiveDeliveries()
            ]);

            return { success: true, message: response.data.message || 'Order accepted successfully' };
        } catch (error) {
            console.error('Failed to accept order:', error);
            let errorMessage = 'Failed to accept order';

            if (error.response?.status === 400) {
                errorMessage = error.response.data.message || 'Order is no longer available';
            } else if (error.response?.status === 404) {
                errorMessage = 'Order not found';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Mark order as picked up
    const markPickedUp = async (orderId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.put(`${API_BASE_URL}/api/delivery/pickup/${orderId}`, {});

            // Refresh active deliveries
            await fetchActiveDeliveries();

            return { success: true, message: response.data.message || 'Order marked as picked up' };
        } catch (error) {
            console.error('Failed to mark as picked up:', error);
            let errorMessage = 'Failed to mark as picked up';

            if (error.response?.status === 404) {
                errorMessage = 'Order not found or not assigned to you';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data.message || 'Invalid order status';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again.';
            }

            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Mark order as delivered
    const markDelivered = async (orderId) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.put(`${API_BASE_URL}/api/delivery/deliver/${orderId}`, {});

            // Refresh data
            await Promise.all([
                fetchActiveDeliveries(),
                fetchEarnings(),
                fetchDeliveryHistory()
            ]);

            return { success: true, message: response.data.message || 'Order delivered successfully', earnings: response.data.earnings };
        } catch (error) {
            console.error('Failed to mark as delivered:', error);
            let errorMessage = 'Failed to mark as delivered';

            if (error.response?.status === 404) {
                errorMessage = 'Order not found or not assigned to you';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data.message || 'Invalid order status';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again.';
            }

            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Decline order
    const declineOrder = async (orderId, reason = 'Unable to reach location') => {
        try {
            setLoading(true);
            const response = await axios.post(`${API_BASE_URL}/api/delivery/decline/${orderId}`, {
                reason
            });

            // Refresh available orders
            await fetchAvailableOrders();

            setError(null);
            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to decline order';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    // Debounce utility function
    const debounce = useCallback((func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }, []);

    // Refresh all data with debouncing
    const refreshData = useCallback(
        debounce(async () => {
            if (!isAuthenticated) return;

            try {
                await Promise.all([
                    fetchAvailableOrders(),
                    fetchActiveDeliveries(),
                    fetchEarnings(),
                    fetchDeliveryHistory()
                ]);
            } catch (error) {
                console.error('Refresh data error:', error);
            }
        }, 1000), // Debounce for 1 second
        [isAuthenticated, fetchAvailableOrders, fetchActiveDeliveries, fetchEarnings, fetchDeliveryHistory, debounce]
    );

    // Initial data fetch
    useEffect(() => {
        if (isAuthenticated) {
            refreshData();
        }
    }, [isAuthenticated]);

    // Expose refresh function globally for socket updates
    useEffect(() => {
        window.refreshDeliveryData = refreshData;
        return () => {
            delete window.refreshDeliveryData;
        };
    }, [refreshData]);

    const value = {
        availableOrders,
        activeDeliveries,
        deliveryHistory,
        earnings,
        loading,
        error,
        fetchAvailableOrders,
        fetchActiveDeliveries,
        fetchDeliveryHistory,
        fetchEarnings,
        acceptOrder,
        declineOrder,
        markPickedUp,
        markDelivered,
        refreshData,
        setError
    };

    return (
        <DeliveryContext.Provider value={value}>
            {children}
        </DeliveryContext.Provider>
    );
};