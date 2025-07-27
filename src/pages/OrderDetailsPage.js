import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DeliveryContext } from '../context/DeliveryContext';
import { LocationContext } from '../context/LocationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './OrderDetailsPage.css';

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { activeDeliveries, markPickedUp, markDelivered } = useContext(DeliveryContext);
    const { currentLocation } = useContext(LocationContext);

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Find the order in active deliveries
        const foundOrder = activeDeliveries.find(o => o._id === orderId);
        setOrder(foundOrder);
        setLoading(false);
    }, [orderId, activeDeliveries]);

    const handleMarkPickedUp = async () => {
        setProcessing(true);
        const result = await markPickedUp(orderId);
        setProcessing(false);

        if (!result.success) {
            alert(result.message);
        }
    };

    const handleMarkDelivered = async () => {
        setProcessing(true);
        const result = await markDelivered(orderId);
        setProcessing(false);

        if (result.success) {
            alert(`Order delivered! You earned ₹${result.earnings || 30}`);
            navigate('/orders');
        } else {
            alert(result.message);
        }
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

    const callCustomer = (phone) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        } else {
            alert('Customer phone number not available');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'assigned': return '#ffc107';
            case 'picked_up': return '#17a2b8';
            case 'in_transit': return '#007bff';
            case 'delivered': return '#28a745';
            default: return '#6c757d';
        }
    };

    const getNextAction = () => {
        if (!order) return null;

        switch (order.status) {
            case 'assigned':
                return {
                    text: 'Mark as Picked Up',
                    action: handleMarkPickedUp,
                    color: 'primary',
                    icon: '📦'
                };
            case 'picked_up':
            case 'in_transit':
                return {
                    text: 'Mark as Delivered',
                    action: handleMarkDelivered,
                    color: 'success',
                    icon: '✅'
                };
            default:
                return null;
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading order details..." />;
    }

    if (!order) {
        return (
            <div className="order-details-page">
                <div className="order-details-container">
                    <div className="not-found">
                        <span className="not-found-icon">📦</span>
                        <h2>Order Not Found</h2>
                        <p>The order you're looking for doesn't exist or is no longer active.</p>
                        <Link to="/orders" className="btn btn-primary">
                            Back to Orders
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const nextAction = getNextAction();

    return (
        <div className="order-details-page">
            <div className="order-details-container">
                <div className="order-details-header">
                    <div className="header-left">
                        <Link to="/orders" className="back-button">
                            ← Back to Orders
                        </Link>
                        <h1>Order #{order._id.slice(-6)}</h1>
                    </div>
                    <div className="header-right">
                        <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                            {order.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                <div className="order-details-content">
                    {/* Customer Information */}
                    <div className="details-card">
                        <div className="card-header">
                            <h3>👤 Customer Information</h3>
                        </div>
                        <div className="card-content">
                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="label">Name:</span>
                                    <span className="value">{order.customer?.name || 'Not provided'}</span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Phone:</span>
                                    <span className="value">
                                        {order.customer?.phone || 'Not provided'}
                                        {order.customer?.phone && (
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => callCustomer(order.customer.phone)}
                                            >
                                                📞 Call
                                            </button>
                                        )}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{order.customer?.email || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="details-card">
                        <div className="card-header">
                            <h3>📍 Delivery Address</h3>
                        </div>
                        <div className="card-content">
                            <div className="address-display">
                                <p className="address-text">{order.deliveryAddress}</p>
                                <div className="address-actions">
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => openInGoogleMaps(order.deliveryAddress)}
                                    >
                                        📍 View on Map
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => getDirections(order.deliveryAddress)}
                                        disabled={!currentLocation}
                                    >
                                        🧭 Get Directions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="details-card">
                        <div className="card-header">
                            <h3>🛍️ Order Items</h3>
                        </div>
                        <div className="card-content">
                            {order.items && order.items.length > 0 ? (
                                <div className="items-list">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="item-row">
                                            <div className="item-info">
                                                <span className="item-name">
                                                    {item.name || item.productName || 'Product'}
                                                </span>
                                                <span className="item-quantity">Qty: {item.quantity || 1}</span>
                                                {item.shopName && (
                                                    <span className="item-shop">From: {item.shopName}</span>
                                                )}
                                            </div>
                                            <div className="item-price">₹{item.price || 0}</div>
                                        </div>
                                    ))}
                                    <div className="items-total">
                                        <div className="total-row">
                                            <span className="total-label">Subtotal:</span>
                                            <span className="total-amount">₹{order.totalAmount || 0}</span>
                                        </div>
                                        {order.deliveryCharge && (
                                            <div className="total-row">
                                                <span className="total-label">Delivery Charge:</span>
                                                <span className="total-amount">₹{order.deliveryCharge}</span>
                                            </div>
                                        )}
                                        <div className="total-row final-total">
                                            <span className="total-label">Total:</span>
                                            <span className="total-amount">₹{(order.totalAmount || 0) + (order.deliveryCharge || 0)}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="no-items">
                                    <span className="no-items-icon">📦</span>
                                    <p>No item details available</p>
                                    <small>Order ID: {order._id}</small>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="details-card">
                        <div className="card-header">
                            <h3>⏱️ Order Timeline</h3>
                        </div>
                        <div className="card-content">
                            <div className="timeline">
                                <div className="timeline-item completed">
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <h4>Order Assigned</h4>
                                        <p>{order.assignedAt ? new Date(order.assignedAt).toLocaleString() : 'Unknown'}</p>
                                    </div>
                                </div>

                                <div className={`timeline-item ${order.status !== 'assigned' ? 'completed' : ''}`}>
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <h4>Picked Up</h4>
                                        <p>{order.pickedUpAt ? new Date(order.pickedUpAt).toLocaleString() : 'Pending'}</p>
                                    </div>
                                </div>

                                <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
                                    <div className="timeline-marker"></div>
                                    <div className="timeline-content">
                                        <h4>Delivered</h4>
                                        <p>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Pending'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Earnings Information */}
                    <div className="details-card">
                        <div className="card-header">
                            <h3>💰 Earnings</h3>
                        </div>
                        <div className="card-content">
                            <div className="earnings-display">
                                <div className="earning-item">
                                    <span className="earning-label">Delivery Fee:</span>
                                    <span className="earning-amount">₹30</span>
                                </div>
                                <div className="earning-item">
                                    <span className="earning-label">Tips:</span>
                                    <span className="earning-amount">₹{order.tips || 0}</span>
                                </div>
                                <div className="earning-total">
                                    <span className="total-label">Total Earning:</span>
                                    <span className="total-amount">₹{30 + (order.tips || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                {nextAction && (
                    <div className="order-actions">
                        <button
                            className={`btn btn-${nextAction.color} btn-large`}
                            onClick={nextAction.action}
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="action-icon">{nextAction.icon}</span>
                                    {nextAction.text}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}