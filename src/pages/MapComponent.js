import React, { useEffect, useRef } from 'react';
import '../styles/glass.css';

export default React.memo(function MapComponent({
    shopLocation,
    deliveryLocation,
    currentLocation,
    directions
}) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const dirRenderer = useRef(null);

    useEffect(() => {
        if (!window.google || !mapRef.current) return;

        mapInstance.current = new window.google.maps.Map(mapRef.current, {
            zoom: 14,
            center: currentLocation || shopLocation,
            styles: [
                { elementType: 'geometry', stylers: [{ color: '#212121' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
            ]
        });

        dirRenderer.current = new window.google.maps.DirectionsRenderer({
            map: mapInstance.current,
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#00F5A0', strokeWeight: 5 }
        });

        // markers
        shopLocation && new window.google.maps.Marker({
            position: shopLocation,
            map: mapInstance.current,
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        });

        deliveryLocation && new window.google.maps.Marker({
            position: deliveryLocation,
            map: mapInstance.current,
            icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
        });

        currentLocation && new window.google.maps.Marker({
            position: currentLocation,
            map: mapInstance.current,
            icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });

        if (directions) dirRenderer.current.setDirections(directions);
    }, [shopLocation, deliveryLocation, currentLocation, directions]);

    return <div ref={mapRef} className="map" />;
});