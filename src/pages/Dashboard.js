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
    FaMap,
    FaUser
} from 'react-icons/fa';
import { MdDeliveryDining, MdRestaurant, MdDirectionsBike } from 'react-icons/md';

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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md">
                            {deliveryBoy?.deliveryBoy?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">Welcome, {deliveryBoy?.deliveryBoy?.name}</h1>
                            <p className="text-sm text-gray-500">Delivery Partner</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg shadow transition-all duration-200"
                    >
                        <FaSignOutAlt className="text-sm" />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </header>

            {/* Status Bar */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white bg-opacity-20 rounded-full">
                            <MdDirectionsBike className="text-xl" />
                        </div>
                        <span className="font-medium">
                            {currentStatus === 'available' ? 'Available for deliveries' :
                                currentStatus === 'on_delivery' ? 'Currently on delivery' : 'Offline'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm font-medium">Active</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                {pendingPopup && !assigned && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 flex items-center">
                            <div className="p-2 bg-white bg-opacity-20 rounded-full mr-3">
                                <FaBell className="text-white" />
                            </div>
                            <h3 className="text-white font-semibold">NEW DELIVERY REQUEST</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="flex items-start">
                                    <div className="p-3 bg-green-100 rounded-full mr-4 text-green-600">
                                        <FaMoneyBillWave className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Earnings</p>
                                        <p className="text-lg font-semibold">₹{pendingPopup.earnAmount}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600">
                                        <FaMapMarkerAlt className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Delivery Address</p>
                                        <p className="text-lg font-semibold">{pendingPopup.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-3 bg-orange-100 rounded-full mr-4 text-orange-600">
                                        <FaBox className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Items</p>
                                        <p className="text-lg font-semibold">{pendingPopup.items.length} items</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-md"
                                >
                                    <FaCheck />
                                    <span className="font-medium">ACCEPT DELIVERY</span>
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-md"
                                >
                                    <FaTimes />
                                    <span className="font-medium">REJECT</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {assigned && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center">
                            <div className="p-2 bg-white bg-opacity-20 rounded-full mr-3">
                                <MdDeliveryDining className="text-white text-xl" />
                            </div>
                            <h3 className="text-white font-semibold">ACTIVE DELIVERY</h3>
                        </div>
                        <div className="p-6">
                            {/* Map Placeholder */}
                            <div className="bg-gray-100 h-64 rounded-xl mb-6 flex flex-col items-center justify-center text-gray-500">
                                <FaMap className="text-4xl mb-3 opacity-50" />
                                <span className="text-lg">Delivery Route Map</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="flex items-start">
                                    <div className="p-3 bg-blue-100 rounded-full mr-4 text-blue-600">
                                        <FaMapMarkerAlt className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Delivery Address</p>
                                        <p className="text-lg font-semibold">{assigned.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-3 bg-orange-100 rounded-full mr-4 text-orange-600">
                                        <MdRestaurant className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Shop</p>
                                        <p className="text-lg font-semibold">{assigned.shopDetails?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-3 bg-green-100 rounded-full mr-4 text-green-600">
                                        <FaUser className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Customer Contact</p>
                                        <p className="text-lg font-semibold">+91 XXXXX XXXXX</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="p-3 bg-purple-100 rounded-full mr-4 text-purple-600">
                                        <FaClock className="text-lg" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-medium">Estimated Time</p>
                                        <p className="text-lg font-semibold">15-20 mins</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-4">DELIVERY ITEMS</h4>
                                <div className="space-y-3">
                                    {assigned.items.map((item, i) => (
                                        <div key={i} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-100">
                                            <span className="text-gray-700">Product ID: {item.productId}</span>
                                            <span className="font-medium text-gray-900">Qty: {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCompleteDelivery}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-lg flex items-center justify-center space-x-3 transition-all duration-200 shadow-md"
                            >
                                <FaCheck />
                                <span className="font-medium">MARK AS DELIVERED</span>
                            </button>
                        </div>
                    </div>
                )}

                {!assigned && !pendingPopup && (
                    <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                        <div className="text-gray-300 mb-5">
                            <MdDeliveryDining className="text-6xl mx-auto" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Active Deliveries</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            You'll be notified when a new delivery request comes in. Stay ready!
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;