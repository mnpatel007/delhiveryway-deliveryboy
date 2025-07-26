import React, { useContext, useEffect, useState } from 'react';
import { LocationContext } from '../context/LocationContext';
import { DeliveryContext } from '../context/DeliveryContext';
// import LoadingSpinner from '../components/LoadingSpinner';
import './MapPage.css';

export default function MapPage() {
    const { currentLocation, isTracking, startTracking, locationError } = useContext(LocationContext);
    const { activeDeliveries } = useContext(DeliveryContext);
    const [selectedDelivery, setSelectedDelivery] = useState(null);

    useEffect(() => {
        if (!isTracking) {
            startTracking();
        }
    }, [isTracking, startTracking]);

    const handleEnableLocation = async () => {
        await startTracking();
    };

    const openInGoogleMaps = (address) => {
        const encodedAddress = encodeURIComponent(address);
        const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
        window.open(url, '_blank');
    };

    const getDirections = (destinationAddress) => {
        if (!currentLocation) {
            alert('Current location not available');
            return;
        }

        const origin = `${currentLocation.lat},${currentLocation.lng}`;
        const destination = encodeURIComponent(destinationAddress);
        const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
        window.open(url, '_blank');
    };

    return (
        <div className="map-page">
            <div className="map-container">
                <div className="map-header">
                    <h1>Delivery Map</h1>
                    <div className="location-status">
                        {isTracking ? (
                            <div className="status-indicator tracking">
                                <span className="status-dot"></span>
                                <span>GPS Active</span>
                            </div>
                        ) : (
                            <div className="status-indicator not-tracking">
                                <span className="status-dot"></span>
                                <span>GPS Inactive</span>
                            </div>
                        )}
                    </div>
                </div>

                {locationError && (
                    <div className="error-banner">
                        <span className="error-icon">⚠️</span>
                        <span>{locationError}</span>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleEnableLocation}
                        >
                            Enable Location
                        </button>
                    </div>
                )}

                <div className="map-content">
                    {/* Current Location Card */}
                    <div className="location-card">
                        <div className="card-header">
                            <h3>📍 Your Current Location</h3>
                        </div>
                        <div className="card-content">
                            {currentLocation ? (
                                <div className="location-info">
                                    <div className="coordinates">
                                        <span className="label">Latitude:</span>
                                        <span className="value">{currentLocation.lat.toFixed(6)}</span>
                                    </div>
                                    <div className="coordinates">
                                        <span className="label">Longitude:</span>
                                        <span className="value">{currentLocation.lng.toFixed(6)}</span>
                                    </div>
                                    <div className="coordinates">
                                        <span className="label">Accuracy:</span>
                                        <span className="value">{currentLocation.accuracy?.toFixed(0)}m</span>
                                    </div>
                                    <div className="coordinates">
                                        <span className="label">Last Updated:</span>
                                        <span className="value">
                                            {new Date(currentLocation.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-location">
                                    <span className="no-location-icon">📍</span>
                                    <p>Location not available</p>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleEnableLocation}
                                    >
                                        Enable Location
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Active Deliveries */}
                    <div className="deliveries-section">
                        <div className="section-header">
                            <h3>🎯 Active Deliveries</h3>
                            <span className="delivery-count">{activeDeliveries.length}</span>
                        </div>

                        {activeDeliveries.length === 0 ? (
                            <div className="empty-state">
                                <span className="empty-icon">📦</span>
                                <h4>No Active Deliveries</h4>
                                <p>Accept orders to see delivery locations here</p>
                            </div>
                        ) : (
                            <div className="deliveries-list">
                                {activeDeliveries.map(delivery => (
                                    <div
                                        key={delivery._id}
                                        className={`delivery-card ${selectedDelivery === delivery._id ? 'selected' : ''}`}
                                        onClick={() => setSelectedDelivery(
                                            selectedDelivery === delivery._id ? null : delivery._id
                                        )}
                                    >
                                        <div className="delivery-header">
                                            <span className="order-id">#{delivery._id.slice(-6)}</span>
                                            <span className={`status-badge ${delivery.status}`}>
                                                {delivery.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="delivery-info">
                                            <div className="customer-info">
                                                <h4>👤 {delivery.customer?.name || 'Customer'}</h4>
                                                <p>📞 {delivery.customer?.phone || 'No phone'}</p>
                                            </div>

                                            <div className="address-info">
                                                <h5>📍 Delivery Address:</h5>
                                                <p>{delivery.deliveryAddress}</p>
                                            </div>
                                        </div>

                                        <div className="delivery-actions">
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openInGoogleMaps(delivery.deliveryAddress);
                                                }}
                                            >
                                                📍 View on Map
                                            </button>

                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    getDirections(delivery.deliveryAddress);
                                                }}
                                                disabled={!currentLocation}
                                            >
                                                🧭 Get Directions
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Map Placeholder */}
                    <div className="map-placeholder">
                        <div className="placeholder-content">
                            <div className="placeholder-icon">🗺️</div>
                            <h3>Interactive Map</h3>
                            <p>
                                A full interactive map with real-time location tracking and
                                delivery route optimization would be displayed here.
                            </p>
                            <div className="map-features">
                                <div className="feature">✅ Real-time GPS tracking</div>
                                <div className="feature">✅ Delivery route optimization</div>
                                <div className="feature">✅ Traffic-aware navigation</div>
                                <div className="feature">✅ Customer location markers</div>
                            </div>
                            <p className="integration-note">
                                <strong>Note:</strong> This would integrate with Google Maps API
                                or similar mapping service in a production environment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}