import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [deliveryBoy, setDeliveryBoy] = useState(() => {
        const savedUser = localStorage.getItem('deliveryBoyUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (userData) => {
        setDeliveryBoy(userData);
        localStorage.setItem('deliveryBoyUser', JSON.stringify(userData));
        localStorage.setItem('token', userData.token); // ✅ CRUCIAL LINE
    };


    const logout = async () => {
        try {
            // Optional: Call backend logout endpoint if needed
            await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/delivery/auth/logout`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${deliveryBoy?.token}`
                    }
                }
            );
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setDeliveryBoy(null);
            localStorage.removeItem('deliveryBoyUser');
            window.location.href = '/login';
        }
    };

    const isAuthenticated = () => {
        return !!deliveryBoy;
    };

    return (
        <AuthContext.Provider value={{
            deliveryBoy,
            login,
            logout,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};