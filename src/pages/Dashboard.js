import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import {
    FaBox,
    FaMapMarkerAlt,
    FaMoneyBillWave,
    FaSignOutAlt,
    FaBell,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
    const { deliveryBoy, logout, isAuthenticated } = useContext(AuthContext);
    const [assigned, setAssigned] = useState(null);
    const [pendingPopup, setPendingPopup] = useState(null);
    const [socket, setSocket] = useState(null);

    // Memoize authentication check
    const isAuthenticatedUser = useMemo(() => {
        return isAuthenticated();
    }, [isAuthenticated]);

    // Always call hooks unconditionally
    useEffect(() => {
        // Create socket connection
        const newSocket = io(process.env.REACT_APP_BACKEND_URL);
        setSocket(newSocket);

        // Cleanup socket on component unmount
        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []); // Empty dependency array

    useEffect(() => {
        // Only proceed if socket and deliveryBoy exist
        if (!socket || !deliveryBoy) return;

        // Register delivery boy
        socket.emit('registerDelivery', deliveryBoy.deliveryBoy._id);

        // Listen for new delivery assignments
        const handleNewAssignment = (payload) => {
            if (!assigned) {
                setPendingPopup(payload);
            }
        };

        socket.on('newDeliveryAssignment', handleNewAssignment);

        // Cleanup
        return () => {
            socket.off('newDeliveryAssignment', handleNewAssignment);
        };
    }, [socket, deliveryBoy, assigned]);

    // If not authenticated, redirect to login
    if (!isAuthenticatedUser) {
        return <Navigate to="/login" />;
    }

    const handleAccept = () => {
        setAssigned(pendingPopup);
        setPendingPopup(null);
    };

    const handleReject = () => {
        setPendingPopup(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-5 bg-slate-100 min-h-screen">
            <div className="flex justify-between items-center mb-8 bg-white p-5 rounded-xl shadow-md">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-500 text-white rounded-full flex justify-center items-center text-2xl font-bold">
                        {deliveryBoy?.deliveryBoy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800 m-0">Welcome, {deliveryBoy?.deliveryBoy?.name}</h2>
                        <p className="text-slate-500 mt-1">Delivery Partner</p>
                    </div>
                </div>
                <button
                    className="flex items-center gap-2 bg-red-500 text-white border-none px-4 py-2 rounded-lg cursor-pointer hover:bg-red-600 transition-colors"
                    onClick={logout}
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>

            {pendingPopup && !assigned && (
                <div className="bg-white rounded-xl p-5 shadow-md mb-5">
                    <div className="flex items-center mb-4">
                        <FaBell className="text-yellow-500 mr-2 text-2xl" />
                        <h3 className="text-lg font-medium">New Delivery Assignment</h3>
                    </div>
                    <div className="flex flex-col gap-2 mb-5">
                        <div className="flex items-center gap-2 text-slate-800">
                            <FaMoneyBillWave />
                            <span>Earn: ₹{pendingPopup.earnAmount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-800">
                            <FaMapMarkerAlt />
                            <span>Destination: {pendingPopup.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-800">
                            <FaBox />
                            <span>Items: {pendingPopup.items.length}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            className="flex items-center gap-2 px-4 py-2 border-none rounded-lg cursor-pointer bg-green-500 text-white hover:bg-green-600 transition-colors"
                            onClick={handleAccept}
                        >
                            <FaCheck /> Accept
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 border-none rounded-lg cursor-pointer bg-red-500 text-white hover:bg-red-600 transition-colors"
                            onClick={handleReject}
                        >
                            <FaTimes /> Reject
                        </button>
                    </div>
                </div>
            )}

            {assigned && (
                <div className="bg-white rounded-xl p-5 shadow-md">
                    <div className="flex items-center mb-5">
                        <FaBox className="text-blue-500 mr-2 text-2xl" />
                        <h3 className="text-lg font-medium">Active Delivery</h3>
                    </div>
                    <div className="flex flex-col gap-4 mb-5">
                        <div className="flex items-center gap-4">
                            <FaMapMarkerAlt className="text-blue-500 text-xl" />
                            <div>
                                <strong className="font-medium">Delivery Address</strong>
                                <p>{assigned.address}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaBox className="text-blue-500 text-xl" />
                            <div>
                                <strong className="font-medium">Shop</strong>
                                <p>{assigned.shopDetails?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <FaMoneyBillWave className="text-blue-500 text-xl" />
                            <div>
                                <strong className="font-medium">Earnings</strong>
                                <p>₹{assigned.earnAmount}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-md font-medium mb-3">Delivery Items</h4>
                        <ul>
                            {assigned.items.map((item, i) => (
                                <li key={i} className="flex justify-between p-2 bg-slate-100 rounded-lg mb-2">
                                    <span>Product ID: {item.productId}</span>
                                    <span>Quantity: {item.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;