import React, { useEffect, useRef, useState } from 'react';
import './MapComponent.css';

const MapComponent = ({ origin, destination }) => {
    const mapRef = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!window.google) {
            setError('Google Maps API failed to load.');
            return;
        }

        if (!mapRef.current) {
            setError('Map container not found.');
            return;
        }

        if (!origin || !destination) {
            setError('Origin or destination is missing.');
            return;
        }

        try {
            const map = new window.google.maps.Map(mapRef.current, {
                center: origin,
                zoom: 12,
                disableDefaultUI: true,
            });

            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                suppressMarkers: true,
                polylineOptions: {
                    strokeColor: '#1a73e8',
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                },
            });

            directionsRenderer.setMap(map);

            const request = {
                origin,
                destination,
                travelMode: 'DRIVING',
            };

            directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);

                    // Custom markers
                    new window.google.maps.Marker({
                        position: origin,
                        map: map,
                        title: 'Origin',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        },
                    });

                    new window.google.maps.Marker({
                        position: destination,
                        map: map,
                        title: 'Destination',
                        icon: {
                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        },
                    });
                } else {
                    setError(`Directions request failed due to ${status}`);
                }
            });
        } catch (e) {
            setError('An error occurred while rendering the map.');
            console.error(e);
        }
    }, [origin, destination]);

    if (error) {
        return <div className="map-error">Error: {error}</div>;
    }

    return <div ref={mapRef} className="map-container" />;
};

export default MapComponent;