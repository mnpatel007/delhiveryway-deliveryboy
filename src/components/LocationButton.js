import React, { useContext, useState } from 'react';
import { LocationContext } from '../context/LocationContext';
import './LocationButton.css';

const LocationButton = () => {
    const {
        currentLocation,
        isTracking,
        locationError,
        permissionStatus,
        startTracking,
        stopTracking,
        requestLocationPermission
    } = useContext(LocationContext);

    const [isRequesting, setIsRequesting] = useState(false);

    const handleLocationToggle = async () => {
        if (permissionStatus === 'denied') {
            alert('Location access is denied. Please enable location services in your browser settings.');
            return;
        }

        if (isTracking) {
            stopTracking();
        } else {
            if (permissionStatus === 'prompt') {
                setIsRequesting(true);
                try {
                    await requestLocationPermission();
                    startTracking();
                } catch (error) {
                    console.error('Location permission failed:', error);
                    alert('Location access is required for delivery tracking. Please enable location services.');
                } finally {
                    setIsRequesting(false);
                }
            } else {
                startTracking();
            }
        }
    };

    const getLocationIcon = () => {
        if (isRequesting) return '⏳';
        if (locationError) return '❌';
        if (isTracking && currentLocation) return '📍';
        if (isTracking) return '🔄';
        return '📍';
    };

    const getLocationStatus = () => {
        if (isRequesting) return 'Requesting...';
        if (locationError) return 'Error';
        if (isTracking && currentLocation) return 'Tracking';
        if (isTracking) return 'Starting...';
        return 'Start Tracking';
    };

    const getButtonClass = () => {
        let baseClass = 'location-button';
        if (isTracking && currentLocation) baseClass += ' active';
        if (locationError) baseClass += ' error';
        if (isRequesting) baseClass += ' requesting';
        return baseClass;
    };

    return (
        <div className="location-button-container">
            <button
                className={getButtonClass()}
                onClick={handleLocationToggle}
                disabled={isRequesting}
                title={getLocationStatus()}
            >
                <span className="location-icon">{getLocationIcon()}</span>
                <span className="location-text">{getLocationStatus()}</span>
            </button>

            {currentLocation && (
                <div className="location-info">
                    <div className="location-accuracy">
                        Accuracy: {Math.round(currentLocation.accuracy)}m
                    </div>
                    {currentLocation.speed && (
                        <div className="location-speed">
                            Speed: {Math.round(currentLocation.speed * 3.6)} km/h
                        </div>
                    )}
                </div>
            )}

            {locationError && (
                <div className="location-error">
                    {locationError}
                </div>
            )}
        </div>
    );
};

export default LocationButton;