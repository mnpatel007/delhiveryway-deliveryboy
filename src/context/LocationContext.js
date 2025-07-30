import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from './AuthContext';
import axios from 'axios';

export const LocationContext = createContext();

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export const LocationProvider = ({ children }) => {
    const { isAuthenticated, deliveryBoy } = useContext(AuthContext);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [watchId, setWatchId] = useState(null);
    const [locationHistory, setLocationHistory] = useState([]);
    const [permissionStatus, setPermissionStatus] = useState('prompt');
    const lastServerUpdate = useRef(null);
    const trackingInitialized = useRef(false);

    // Check location permission
    const checkLocationPermission = useCallback(async () => {
        if (!navigator.permissions) {
            return 'prompt';
        }

        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            setPermissionStatus(permission.state);
            return permission.state;
        } catch (error) {
            console.error('Permission check failed:', error);
            return 'prompt';
        }
    }, []);

    // Mobile-optimized location options
    const getLocationOptions = (highAccuracy = true) => ({
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 15000 : 10000, // Longer timeout for high accuracy
        maximumAge: highAccuracy ? 30000 : 60000 // Cache for 30s/60s
    });

    // Get current position with mobile optimization
    const getCurrentPosition = useCallback((highAccuracy = true) => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            const options = getLocationOptions(highAccuracy);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: new Date().toISOString()
                    };

                    setCurrentLocation(location);
                    setLocationError(null);

                    // Add to history
                    setLocationHistory(prev => [
                        location,
                        ...prev.slice(0, 49) // Keep last 50 locations
                    ]);

                    resolve(location);
                },
                (error) => {
                    let errorMessage = 'Failed to get location';
                    let shouldRetry = false;

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enable location services.';
                            setPermissionStatus('denied');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location unavailable. Please check your GPS.';
                            shouldRetry = true;
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out. Retrying...';
                            shouldRetry = true;
                            break;
                        default:
                            errorMessage = 'Unknown location error';
                            shouldRetry = true;
                            break;
                    }

                    setLocationError(errorMessage);

                    // Retry with lower accuracy if high accuracy failed
                    if (shouldRetry && highAccuracy) {
                        console.log('Retrying with lower accuracy...');
                        setTimeout(() => {
                            getCurrentPosition(false).then(resolve).catch(reject);
                        }, 1000);
                    } else {
                        reject(new Error(errorMessage));
                    }
                },
                options
            );
        });
    }, []);

    // Update location on server
    const updateLocationOnServer = useCallback(async (location) => {
        if (!isAuthenticated || !deliveryBoy?._id) return;

        try {
            await axios.put(`${API_BASE_URL}/api/delivery/location`, {
                lat: location.lat,
                lng: location.lng,
                accuracy: location.accuracy,
                timestamp: location.timestamp
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('Failed to update location on server:', error);
        }
    }, [isAuthenticated, deliveryBoy]);

    // Calculate distance between two points (Haversine formula)
    const getDistance = (pos1, pos2) => {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = pos1.lat * Math.PI / 180;
        const φ2 = pos2.lat * Math.PI / 180;
        const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
        const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    };

    // Start location tracking
    const startTracking = useCallback(async () => {
        if (!navigator.geolocation) {
            console.log('Geolocation not supported');
            return false;
        }

        if (isTracking) {
            console.log('Location tracking already active');
            return true;
        }

        try {
            console.log('Starting location tracking...');

            // First get current position to check permissions
            await getCurrentPosition(true);

            setIsTracking(true);
            setLocationError(null);
            setPermissionStatus('granted');

            const options = getLocationOptions(true);

            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: new Date().toISOString()
                    };

                    setCurrentLocation(location);
                    setLocationError(null);

                    // Add to history
                    setLocationHistory(prev => [
                        location,
                        ...prev.slice(0, 49)
                    ]);

                    // Update server every 30 seconds or if moved significantly
                    const now = Date.now();
                    const shouldUpdate = !lastServerUpdate.current ||
                        now - lastServerUpdate.current > 30000 ||
                        (currentLocation && getDistance(currentLocation, location) > 50); // 50 meters

                    if (shouldUpdate) {
                        updateLocationOnServer(location);
                        lastServerUpdate.current = now;
                    }
                },
                (error) => {
                    console.error('Location tracking error:', error);
                    let errorMessage = 'Location tracking failed';

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location permission denied';
                            setPermissionStatus('denied');
                            setIsTracking(false);
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location unavailable';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location timeout';
                            break;
                    }

                    setLocationError(errorMessage);
                },
                options
            );

            setWatchId(id);
            return true;
        } catch (error) {
            console.error('Failed to start location tracking:', error);
            setIsTracking(false);
            return false;
        }
    }, [isTracking, getCurrentPosition, updateLocationOnServer, currentLocation]);

    // Stop location tracking
    const stopTracking = useCallback(() => {
        if (watchId) {
            navigator.geolocation.clearWatch(watchId);
            setWatchId(null);
        }
        setIsTracking(false);
        console.log('Location tracking stopped');
    }, [watchId]);

    // Request location permission
    const requestLocationPermission = useCallback(async () => {
        try {
            const location = await getCurrentPosition(true);
            setPermissionStatus('granted');
            return location;
        } catch (error) {
            console.error('Location permission request failed:', error);
            throw error;
        }
    }, [getCurrentPosition]);

    // Get address from coordinates (reverse geocoding)
    const getAddressFromCoords = useCallback(async (lat, lng) => {
        try {
            const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            const data = await response.json();
            return data.display_name || data.locality || 'Unknown location';
        } catch (error) {
            console.error('Reverse geocoding failed:', error);
            return 'Unknown location';
        }
    }, []);

    // Auto-start tracking when authenticated (only once)
    useEffect(() => {
        if (isAuthenticated && deliveryBoy && !trackingInitialized.current) {
            trackingInitialized.current = true;
            checkLocationPermission().then((permission) => {
                if (permission === 'granted' && !isTracking) {
                    startTracking();
                }
            });
        } else if (!isAuthenticated) {
            trackingInitialized.current = false;
            if (isTracking) {
                stopTracking();
            }
        }

        return () => {
            if (isTracking) {
                stopTracking();
            }
        };
    }, [isAuthenticated, deliveryBoy]); // Remove isTracking from dependencies to prevent loop

    // Check permission on mount
    useEffect(() => {
        checkLocationPermission();
    }, [checkLocationPermission]);

    // Monitor permission changes
    useEffect(() => {
        if (!navigator.permissions) return;

        let permissionWatcher;

        const setupPermissionWatcher = async () => {
            try {
                const permission = await navigator.permissions.query({ name: 'geolocation' });

                permission.onchange = () => {
                    setPermissionStatus(permission.state);
                    if (permission.state === 'denied' && isTracking) {
                        stopTracking();
                        setLocationError('Location permission was denied');
                    }
                };

                permissionWatcher = permission;
            } catch (error) {
                console.error('Failed to setup permission watcher:', error);
            }
        };

        setupPermissionWatcher();

        return () => {
            if (permissionWatcher) {
                permissionWatcher.onchange = null;
            }
        };
    }, [isTracking, stopTracking]);

    const value = {
        currentLocation,
        locationError,
        isTracking,
        locationHistory,
        permissionStatus,
        getCurrentPosition,
        startTracking,
        stopTracking,
        getDistance,
        getAddressFromCoords,
        requestLocationPermission,
        checkLocationPermission,
        setLocationError
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};