import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DeliveryContext } from '../context/DeliveryContext';
import { LocationContext } from '../context/LocationContext';
import MapComponent from './MapComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import './MapPage.css';

export default function MapPage() {
    const { orderId } = useParams();
    const { activeDeliveries } = useContext(DeliveryContext);
    const { currentLocation } = useContext(LocationContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const foundOrder = activeDeliveries.find(o => o._id === orderId);
        setOrder(foundOrder);
        setLoading(false);
    }, [orderId, activeDeliveries]);

    if (loading) {
        return <LoadingSpinner message="Loading map..." />;
    }

    if (!order) {
        return <div className="map-page-container"><h2>Order not found</h2></div>;
    }

    const getRoute = () => {
        if (order.status === 'assigned') {
            return {
                origin: currentLocation,
                destination: order.shopLocation,
                label: 'Route to Shop'
            };
        } else if (order.status === 'picked_up' || order.status === 'in_transit') {
            return {
                origin: order.shopLocation,
                destination: order.customerLocation,
                label: 'Route to Customer'
            };
        }
        return null;
    };

    const route = getRoute();

    return (
        <div className="map-page-container">
            <div className="map-header">
                <h1>{route ? route.label : 'Map'}</h1>
                <p>Order ID: #{order._id.slice(-6)}</p>
            </div>
            <div className="map-content">
                {route ? (
                    <MapComponent
                        origin={route.origin}
                        destination={route.destination}
                    />
                ) : (
                    <p>No active route for this order status.</p>
                )}
            </div>
        </div>
    );
}