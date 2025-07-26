import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { mockAvailableOrders, mockActiveDeliveries, mockEarnings, useMockData } from '../utils/mockData';

export const DeliveryContext = createContext();

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const DeliveryProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [deliveryHistory, setDeliveryHistory] = useState([]);
    const [earnings, setEarnings] = useState({
        totalEarnings: 0,
        totalDeliveries: 0,
        todayEarnings: 0,
        weekEarnings: 0,
        monthEarnings: 0,
        todayDeliveries: 0,
        weekDeliveries: 0,
        monthDeliveries: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch available orders
    const fetchAvailableOrders = async (retryCount = 0) => {
        if (!isAuthenticated) return;

        // Use mock data if enabled
        if (useMockData()) {
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
        if (useMockData()) {
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
        if (useMockData()) {
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
            const response = await axios.post(`${API_BASE_URL}/api/delivery/accept/${orderId}`, {
                currentLocation
            });

            // Refresh data
            await Promise.all([
                fetchAvailableOrders(),
                fetchActiveDeliveries()
            ]);

            setError(null);
            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to accept order';
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
            const response = await axios.put(`${API_BASE_URL}/api/delivery/pickup/${orderId}`);

            // Refresh active deliveries
            await fetchActiveDeliveries();

            setError(null);
            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to mark as picked up';
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
            const response = await axios.put(`${API_BASE_URL}/api/delivery/deliver/${orderId}`);

            // Refresh data
            await Promise.all([
                fetchActiveDeliveries(),
                fetchEarnings(),
                fetchDeliveryHistory()
            ]);

            setError(null);
            return { success: true, message: response.data.message, earnings: response.data.earnings };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to mark as delivered';
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

    // Refresh all data
    const refreshData = async () => {
        if (!isAuthenticated) return;

        await Promise.all([
            fetchAvailableOrders(),
            fetchActiveDeliveries(),
            fetchEarnings(),
            fetchDeliveryHistory()
        ]);
    };

    // Initial data fetch
    useEffect(() => {
        if (isAuthenticated) {
            refreshData();
        }
    }, [isAuthenticated]);

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