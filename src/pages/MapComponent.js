import React, { useEffect, useRef } from 'react';
import './MapComponent.css';

export default React.memo(function MapComponent({ shopLocation, deliveryLocation, currentLocation, directions, mapPhase }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markers = useRef([]);
    const directionsRenderer = useRef(null);

    useEffect(() => {
        if (!window.google || !window.google.maps || !mapRef.current) {
            console.warn("Google Maps API not loaded or map ref not available.");
            return;
        }

        // Initialize map only once
        if (!mapInstance.current) {
            mapInstance.current = new window.google.maps.Map(mapRef.current, {
                zoom: 13,
                center: currentLocation || shopLocation || deliveryLocation || { lat: 0, lng: 0 },
                mapTypeControl: true,
                streetViewControl: false
            });

            directionsRenderer.current = new window.google.maps.DirectionsRenderer({
                map: mapInstance.current,
                suppressMarkers: true // We will add custom markers
            });
        }

        // Clear existing markers
        markers.current.forEach(marker => marker.setMap(null));
        markers.current = [];

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

        // Add/update driver marker
        if (currentLocation) {
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
            // Center map on driver's current location
            mapInstance.current.panTo(currentLocation);
        } else if (shopLocation) {
            // If no current location, center on shop
            mapInstance.current.panTo(shopLocation);
        }


        // Display directions if available
        if (directions && directionsRenderer.current) {
            directionsRenderer.current.setDirections(directions);
        } else if (directionsRenderer.current) {
            directionsRenderer.current.setDirections({ routes: [] }); // Clear directions if none
        }

        // Adjust map bounds to fit all markers and directions
        if (mapInstance.current && markers.current.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            markers.current.forEach(marker => bounds.extend(marker.getPosition()));
            if (directions && directions.routes && directions.routes.length > 0) {
                bounds.union(directions.routes[0].bounds);
            }
            mapInstance.current.fitBounds(bounds);
        }

        return () => {
            // Cleanup is handled by re-rendering effect, but ensure map is cleared on unmount
            if (directionsRenderer.current) {
                directionsRenderer.current.setMap(null);
            }
            markers.current.forEach(marker => marker.setMap(null));
            markers.current = [];
        };
    }, [shopLocation, deliveryLocation, currentLocation, directions, mapPhase]); // Added directions and mapPhase to dependencies

    return (
        <div className="map-container">
            <div ref={mapRef} className="map" />
            <div className="location-info">
                {currentLocation && (
                    <div className="location-card">
                        <span className="icon delivery"><MdLocationOn /></span>
                        <div>
                            <h4>Your Current Location</h4>
                            <p>{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
                        </div>
                    </div>
                )}
                {shopLocation && (
                    <div className="location-card">
                        <span className="icon shop"><MdLocationOn /></span>
                        <div>
                            <h4>Shop Location</h4>
                            <p>{shopLocation.lat.toFixed(4)}, {shopLocation.lng.toFixed(4)}</p>
                        </div>
                    </div>
                )}
                {deliveryLocation && (
                    <div className="location-card">
                        <span className="icon delivery"><MdLocationOn /></span>
                        <div>
                            <h4>Customer Location</h4>
                            <p>{deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});
