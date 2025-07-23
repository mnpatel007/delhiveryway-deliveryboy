import React, { useEffect, useRef } from 'react';
import './MapComponent.css';

export default React.memo(function MapComponent({ shopLocation, deliveryLocation, currentLocation }) { // Added React.memo
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markers = useRef([]);
    const directionsService = useRef(null);
    const directionsRenderer = useRef(null);

    useEffect(() => {
        if (window.google && mapRef.current) {
            // Initialize map
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                zoom: 13,
                center: shopLocation || { lat: 0, lng: 0 },
                mapTypeControl: true,
                streetViewControl: false
            });

            // Initialize services
            directionsService.current = new window.google.maps.DirectionsService();
            directionsRenderer.current = new window.google.maps.DirectionsRenderer({
                map: mapInstance.current,
                suppressMarkers: true
            });

            // Add shop marker
            if (shopLocation) {
                markers.current.push(
                    new window.google.maps.Marker({
                        position: shopLocation,
                        map: mapInstance.current,
                        title: 'Shop Location',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                        }
                    })
                );
            }

            // Add delivery marker
            if (deliveryLocation) {
                markers.current.push(
                    new window.google.maps.Marker({
                        position: deliveryLocation,
                        map: mapInstance.current,
                        title: 'Delivery Location',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                        }
                    })
                );
            }

            // Calculate and display route
            if (shopLocation && deliveryLocation) {
                calculateAndDisplayRoute();
            }
        }

        return () => {
            // Clean up markers
            markers.current.forEach(marker => marker.setMap(null));
            markers.current = [];
            // Clear directions
            if (directionsRenderer.current) {
                directionsRenderer.current.setMap(null);
            }
        };
    }, [shopLocation, deliveryLocation]);

    useEffect(() => {
        if (window.google && mapInstance.current && currentLocation) {
            // Add/update driver marker
            const driverMarker = markers.current.find(m => m.title === 'Driver');

            if (driverMarker) {
                driverMarker.setPosition(currentLocation);
            } else {
                markers.current.push(
                    new window.google.maps.Marker({
                        position: currentLocation,
                        map: mapInstance.current,
                        title: 'Driver',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                        }
                    })
                );
            }

            // Center map on driver if moving
            if (markers.current.length > 0) {
                mapInstance.current.panTo(currentLocation);
            }
        }
    }, [currentLocation]);

    const calculateAndDisplayRoute = () => {
        directionsService.current.route(
            {
                origin: shopLocation,
                destination: deliveryLocation,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (response, status) => {
                if (status === 'OK') {
                    directionsRenderer.current.setDirections(response);
                } else {
                    console.error('Directions request failed due to ' + status);
                }
            }
        );
    };

    return <div ref={mapRef} className="map" />;
}); // Added React.memo

