import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [deliveryBoy, setDeliveryBoy] = useState(() => {
        const saved = localStorage.getItem('deliveryBoy');
        return saved ? JSON.parse(saved) : null;
    });

    const login = (userData) => {
        localStorage.setItem('deliveryBoy', JSON.stringify(userData));
        setDeliveryBoy(userData);
    };

    const logout = () => {
        localStorage.removeItem('deliveryBoy');
        setDeliveryBoy(null);
    };

    return (
        <AuthContext.Provider value={{ deliveryBoy, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
