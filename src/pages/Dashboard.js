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
    FaUser,
    FaMapPin
} from 'react-icons/fa';
import { MdDeliveryDining, MdRestaurant } from 'react-icons/md';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';
import './Dashboard.css';

const Dashboard = () => {
    const { deliveryBoy, logout, isAuthenticated } = useContext(AuthContext);
    const [assigned, setAssigned] = useState(null);
    const [pendingPopup, setPendingPopup] = useState(null);
    const [socket, setSocket] = useState(null);
    const [currentStatus, setCurrentStatus] = useState('available');
    const [currentLocation, setCurrentLocation] = useState(null);
    const [directions, setDirections] = useState(null);

    const isAuthenticatedUser = useMemo(() => {
        return isAuthenticated();
    }, [isAuthenticated]);

    useEffect(() => {
        const newSocket = io(process.env.REACT_APP_BACKEND_URL);
        setSocket(newSocket);

        // Get current location for tracking
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setCurrentLocation(location);
                    if (newSocket && deliveryBoy?.deliveryBoy?._id) {
                        newSocket.emit('updateLocation', {
                            deliveryBoyId: deliveryBoy.deliveryBoy._id,
                            location
                        });
                    }
                },
                (error) => console.error(error),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [deliveryBoy]);

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

    useEffect(() => {
        if (assigned?.shopDetails?.location && assigned?.location) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: assigned.shopDetails.location,
                    destination: assigned.location,
                    travelMode: window.google.maps.TravelMode.DRIVING
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirections(result);
                    } else {
                        console.error(`error fetching directions ${result}`);
                    }
                }
            );
        }
    }, [assigned]);

    if (!isAuthenticatedUser) {
        return <Navigate to="/login" />;
    }

    const handleAccept = async () => {
        if (!pendingPopup?.orderId) return;
        try {
            // Try to get token from localStorage or AuthContext
            let token = localStorage.getItem('token');
            if (!token && deliveryBoy?.token) token = deliveryBoy.token;
            if (!token) {
                alert('No authentication token found. Please log in again.');
                logout();
                return;
            }
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${pendingPopup.orderId}/accept`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setAssigned(pendingPopup);
                setPendingPopup(null);
                setCurrentStatus('on_delivery');
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to accept delivery');
                console.error('Accept delivery error:', data);
            }
        } catch (err) {
            alert('Network error while accepting delivery');
            console.error('Accept delivery network error:', err);
        }
    };

    const handleReject = () => {
        setPendingPopup(null);
    };

    const handleCompleteDelivery = async () => {
        if (!assigned?.orderId) return;
        try {
            let token = localStorage.getItem('token');
            if (!token && deliveryBoy?.token) token = deliveryBoy.token;
            if (!token) {
                alert('No authentication token found. Please log in again.');
                logout();
                return;
            }
            const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/orders/${assigned.orderId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setAssigned(null);
                setCurrentStatus('available');
                setDirections(null);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to complete delivery');
                console.error('Complete delivery error:', data);
            }
        } catch (err) {
            alert('Network error while completing delivery');
            console.error('Complete delivery network error:', err);
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="profile-section">
                    <div className="profile-avatar">
                        {deliveryBoy?.deliveryBoy?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h2>Welcome, {deliveryBoy?.deliveryBoy?.name}</h2>
                        <p>Delivery Partner</p>
                    </div>
                </div>
                <button className="logout-button" onClick={logout}>
                    <FaSignOutAlt /> Logout
                </button>
            </header>

            <div className="status-bar">
                <div className="status-content">
                    <MdDeliveryDining className="status-icon" />
                    <span className="status-text">
                        {currentStatus === 'available' ? 'Available for deliveries' :
                            currentStatus === 'on_delivery' ? 'Currently on delivery' : 'Offline'}
                    </span>
                </div>
                <div className="status-indicator">
                    <div className="indicator-dot"></div>
                    <span>Active</span>
                </div>
            </div>

            <main className="dashboard-main">
                {pendingPopup && !assigned && (
                    <div className="delivery-notification">
                        <div className="notification-header">
                            <FaBell className="notification-icon" />
                            <h3>NEW DELIVERY REQUEST</h3>
                        </div>
                        <div className="notification-details">
                            <div className="detail-item">
                                <FaMoneyBillWave className="detail-icon" />
                                <div>
                                    <p className="detail-label">Earnings</p>
                                    <p className="detail-value">₹{pendingPopup.earnAmount}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaMapMarkerAlt className="detail-icon" />
                                <div>
                                    <p className="detail-label">Delivery Address</p>
                                    <p className="detail-value">{pendingPopup.address}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaBox className="detail-icon" />
                                <div>
                                    <p className="detail-label">Items</p>
                                    <p className="detail-value">{pendingPopup.items.length} items</p>
                                </div>
                            </div>
                        </div>
                        <div className="notification-actions">
                            <button className="accept-button" onClick={handleAccept}>
                                <FaCheck /> ACCEPT DELIVERY
                            </button>
                            <button className="reject-button" onClick={handleReject}>
                                <FaTimes /> REJECT
                            </button>
                        </div>
                    </div>
                )}

                {assigned && (
                    <div className="active-delivery">
                        <div className="delivery-header">
                            <MdDeliveryDining className="delivery-icon" />
                            <h3>ACTIVE DELIVERY #{assigned.orderId}</h3>
                        </div>

                        <div className="map-container">
                            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                                <GoogleMap
                                    mapContainerStyle={{ width: '100%', height: '400px', borderRadius: '12px' }}
                                    center={currentLocation || assigned.shopDetails.location}
                                    zoom={13}
                                >
                                    {assigned.shopDetails.location && (
                                        <Marker
                                            position={assigned.shopDetails.location}
                                            icon={{
                                                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                            }}
                                        />
                                    )}
                                    {assigned.location && (
                                        <Marker
                                            position={assigned.location}
                                            icon={{
                                                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                            }}
                                        />
                                    )}
                                    {currentLocation && (
                                        <Marker
                                            position={currentLocation}
                                            icon={{
                                                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                                            }}
                                        />
                                    )}
                                    {directions && (
                                        <DirectionsRenderer directions={directions} />
                                    )}
                                </GoogleMap>
                            </LoadScript>

                            <div className="location-info">
                                <div className="location-card">
                                    <FaMapPin className="icon shop" />
                                    <div>
                                        <h4>PICKUP LOCATION</h4>
                                        <p>{assigned.shopDetails.name}</p>
                                        <p>{assigned.shopDetails.address}</p>
                                    </div>
                                </div>

                                <div className="location-card">
                                    <FaMapPin className="icon delivery" />
                                    <div>
                                        <h4>DELIVERY LOCATION</h4>
                                        <p>{assigned.address}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="delivery-details">
                            <div className="detail-item">
                                <FaClock className="detail-icon" />
                                <div>
                                    <p className="detail-label">Estimated Time</p>
                                    <p className="detail-value">15-20 mins</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaPhone className="detail-icon" />
                                <div>
                                    <p className="detail-label">Customer Contact</p>
                                    <p className="detail-value">+91 XXXXX XXXXX</p>
                                </div>
                            </div>
                        </div>

                        <div className="delivery-items">
                            <h4>DELIVERY ITEMS</h4>
                            <div className="items-list">
                                {assigned.items.map((item, i) => (
                                    <div key={i} className="item-card">
                                        <span>Product ID: {item.productId}</span>
                                        <span className="item-quantity">Qty: {item.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="complete-button" onClick={handleCompleteDelivery}>
                            <FaCheck /> MARK AS DELIVERED
                        </button>
                    </div>
                )}

                {!assigned && !pendingPopup && (
                    <div className="empty-state">
                        <MdDeliveryDining className="empty-icon" />
                        <h3>No Active Deliveries</h3>
                        <p>You'll be notified when a new delivery request comes in. Stay ready!</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;