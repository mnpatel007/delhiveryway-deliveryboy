import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const { isAuthenticated, updateLocation } = useContext(AuthContext);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [watchId, setWatchId] = useState(null);

    // Get current position
    const getCurrentPosition = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };
                    resolve(location);
                },
                (error) => {
                    let errorMessage = 'Failed to get location';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out';
                            break;
                        default:
                            errorMessage = 'Unknown location error';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    };

    // Start location tracking
    const startTracking = async () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by this browser');
            return false;
        }

        try {
            // Get initial position
            const initialLocation = await getCurrentPosition();
            setCurrentLocation(initialLocation);
            setLocationError(null);

            // Update backend with initial location
            if (isAuthenticated) {
                await updateLocation(initialLocation);
            }

            // Start watching position
            const id = navigator.geolocation.watchPosition(
                async (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: new Date().toISOString()
                    };

                    setCurrentLocation(location);

                    // Update backend every 30 seconds or if moved significantly
                    const lastUpdate = currentLocation?.timestamp;
                    const timeDiff = lastUpdate ? new Date() - new Date(lastUpdate) : Infinity;
                    const distanceMoved = lastUpdate ? calculateDistance(
                        currentLocation.lat,
                        currentLocation.lng,
                        location.lat,
                        location.lng
                    ) : Infinity;

                    if (isAuthenticated && (timeDiff > 30000 || distanceMoved > 50)) {
                        await updateLocation(location);
                    }
                },
                (error) => {
                    console.error('Location tracking error:', error);
                    setLocationError(error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 30000
                }
            );

            setWatchId(id);
            setIsTracking(true);
            return true;
        } catch (error) {
            setLocationError(error.message);
            return false;
        }
    };

    // Stop location tracking
    const stopTracking = () => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
    };

    // Calculate distance between two points (in meters)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    // Get address from coordinates (reverse geocoding)
    const getAddressFromCoords = async (lat, lng) => {
        try {
            // Using a simple reverse geocoding service
            // In production, you might want to use Google Maps Geocoding API
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            const data = await response.json();
            return data.display_name || data.locality || 'Unknown location';
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return 'Unknown location';
        }
    };

    // Request location permission
    const requestLocationPermission = async () => {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return permission.state;
        } catch (error) {
            console.error('Permission query failed:', error);
            return 'prompt';
        }
    };

    // Auto-start tracking when authenticated
    useEffect(() => {
        if (isAuthenticated && !isTracking) {
            startTracking();
        } else if (!isAuthenticated && isTracking) {
            stopTracking();
        }

        return () => {
            if (isTracking) {
                stopTracking();
            }
        };
    }, [isAuthenticated]);

    const value = {
        currentLocation,
        locationError,
        isTracking,
        getCurrentPosition,
        startTracking,
        stopTracking,
        calculateDistance,
        getAddressFromCoords,
        requestLocationPermission,
        setLocationError
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};