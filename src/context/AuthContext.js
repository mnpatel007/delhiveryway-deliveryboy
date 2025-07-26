import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
    const [deliveryBoy, setDeliveryBoy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    // Verify token on app load
    const verifyToken = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API_BASE_URL}/api/delivery/auth/verify-token`);
            setDeliveryBoy(response.data.deliveryBoy);
            setError(null);
        } catch (error) {
            console.error('Token verification failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post(`${API_BASE_URL}/api/delivery/auth/login`, {
                email,
                password
            });

            const { deliveryBoy: deliveryBoyData, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('deliveryBoy', JSON.stringify(deliveryBoyData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setDeliveryBoy(deliveryBoyData);

            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const signup = async (userData) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post(`${API_BASE_URL}/api/delivery/auth/signup`, userData);

            const { deliveryBoy: deliveryBoyData, token } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('deliveryBoy', JSON.stringify(deliveryBoyData));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setDeliveryBoy(deliveryBoyData);

            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Signup failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_BASE_URL}/api/delivery/auth/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('deliveryBoy');
            delete axios.defaults.headers.common['Authorization'];
            setDeliveryBoy(null);
            setError(null);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            setError(null);
            const response = await axios.put(`${API_BASE_URL}/api/delivery/profile`, profileData);

            const updatedDeliveryBoy = response.data.deliveryBoy;
            setDeliveryBoy(updatedDeliveryBoy);
            localStorage.setItem('deliveryBoy', JSON.stringify(updatedDeliveryBoy));

            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Profile update failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const updateOnlineStatus = async (isOnline) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/delivery/status`, { isOnline });

            const updatedDeliveryBoy = response.data.deliveryBoy;
            setDeliveryBoy(updatedDeliveryBoy);
            localStorage.setItem('deliveryBoy', JSON.stringify(updatedDeliveryBoy));

            return { success: true, message: response.data.message };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Status update failed';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        }
    };

    const updateLocation = async (location) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/delivery/location`, location);

            const updatedDeliveryBoy = response.data.deliveryBoy;
            setDeliveryBoy(updatedDeliveryBoy);
            localStorage.setItem('deliveryBoy', JSON.stringify(updatedDeliveryBoy));

            return { success: true, message: response.data.message };
        } catch (error) {
            console.error('Location update failed:', error);
            return { success: false, message: 'Location update failed' };
        }
    };

    const isAuthenticated = deliveryBoy !== null && localStorage.getItem('token') !== null;

    const value = {
        deliveryBoy,
        loading,
        error,
        isAuthenticated,
        login,
        signup,
        logout,
        updateProfile,
        updateOnlineStatus,
        updateLocation,
        setError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

