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
    FaTimes,
    FaMotorcycle,
    FaClock,
    FaPhone,
    FaMap
} from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';

const Dashboard = () => {
    const { deliveryBoy, logout, isAuthenticated } = useContext(AuthContext);
    const [assigned, setAssigned] = useState(null);
    const [pendingPopup, setPendingPopup] = useState(null);
    const [socket, setSocket] = useState(null);
    const [currentStatus, setCurrentStatus] = useState('available');

    const isAuthenticatedUser = useMemo(() => {
        return isAuthenticated();
    }, [isAuthenticated]);

    useEffect(() => {
        const newSocket = io(process.env.REACT_APP_BACKEND_URL);
        setSocket(newSocket);

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !deliveryBoy) return;

        socket.emit('registerDelivery', deliveryBoy.deliveryBoy._id);

        const handleNewAssignment = (payload) => {
            if (!assigned) {
                setPendingPopup(payload);
            }
        };

        socket.on('newDeliveryAssignment', handleNewAssignment);

        return () => {
            socket.off('newDeliveryAssignment', handleNewAssignment);
        };
    }, [socket, deliveryBoy, assigned]);

    if (!isAuthenticatedUser) {
        return <Navigate to="/login" />;
    }

    const handleAccept = () => {
        setAssigned(pendingPopup);
        setPendingPopup(null);
        setCurrentStatus('on_delivery');
    };

    const handleReject = () => {
        setPendingPopup(null);
    };

    const handleCompleteDelivery = () => {
        setAssigned(null);
        setCurrentStatus('available');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md p-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {deliveryBoy?.deliveryBoy?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Welcome, {deliveryBoy?.deliveryBoy?.name}</h2>
                            <p className="text-gray-500">Delivery Partner</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FaSignOutAlt />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Status Bar */}
            <div className="bg-blue-600 text-white p-3">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <MdDeliveryDining className="text-xl" />
                        <span className="font-medium">
                            {currentStatus === 'available' ? 'Available for delivery' :
                                currentStatus === 'on_delivery' ? 'On Delivery' : 'Offline'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm">Active</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-4">
                {pendingPopup && !assigned && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="bg-yellow-500 p-4 flex items-center">
                            <FaBell className="text-white text-xl mr-2" />
                            <h3 className="text-white font-semibold">New Delivery Request</h3>
                        </div>
                        <div className="p-4">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <FaMoneyBillWave className="text-green-500 mr-3" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Earnings</p>
                                        <p className="font-semibold">₹{pendingPopup.earnAmount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="text-blue-500 mr-3" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Delivery Address</p>
                                        <p className="font-semibold">{pendingPopup.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaBox className="text-orange-500 mr-3" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Items</p>
                                        <p className="font-semibold">{pendingPopup.items.length} items</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4 mt-6">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <FaCheck />
                                    <span>Accept Delivery</span>
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <FaTimes />
                                    <span>Reject</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {assigned && (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                        <div className="bg-blue-500 p-4 flex items-center">
                            <FaMotorcycle className="text-white text-xl mr-2" />
                            <h3 className="text-white font-semibold">Active Delivery</h3>
                        </div>
                        <div className="p-4">
                            {/* Map Placeholder */}
                            <div className="bg-gray-200 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                                <FaMap className="text-3xl mr-2" />
                                <span>Delivery Route Map</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <FaMapMarkerAlt className="text-blue-500 mr-3" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Delivery Address</p>
                                        <p className="font-semibold">{assigned.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaBox className="text-orange-500 mr-3" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Shop</p>
                                        <p className="font-semibold">{assigned.shopDetails?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaPhone className="text-green-500 mr-3" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Customer Contact</p>
                                        <p className="font-semibold">+91 XXXXX XXXXX</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <FaClock className="text-purple-500 mr-3" />
                                    <div>
                                        <p className="text-gray-500 text-sm">Estimated Time</p>
                                        <p className="font-semibold">15-20 mins</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="font-medium mb-2">Delivery Items</h4>
                                <div className="space-y-2">
                                    {assigned.items.map((item, i) => (
                                        <div key={i} className="bg-gray-50 p-3 rounded-lg flex justify-between">
                                            <span>Product ID: {item.productId}</span>
                                            <span className="font-medium">Qty: {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCompleteDelivery}
                                className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                            >
                                <FaCheck />
                                <span>Mark as Delivered</span>
                            </button>
                        </div>
                    </div>
                )}

                {!assigned && !pendingPopup && (
                    <div className="bg-white rounded-xl shadow-md p-6 text-center">
                        <div className="text-gray-400 mb-4">
                            <FaMotorcycle className="text-5xl mx-auto" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Deliveries</h3>
                        <p className="text-gray-500">You'll be notified when a new delivery request comes in</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;