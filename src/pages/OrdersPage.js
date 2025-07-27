import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DeliveryContext } from '../context/DeliveryContext';
import { LocationContext } from '../context/LocationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './OrdersPage.css';

export default function OrdersPage() {
    const {
        availableOrders,
        activeDeliveries,
        loading,
        error,
        acceptOrder,
        declineOrder,
        markPickedUp,
        markDelivered,
        refreshData
    } = useContext(DeliveryContext);
    const { currentLocation } = useContext(LocationContext);

    const [activeTab, setActiveTab] = useState('available');
    const [processingOrder, setProcessingOrder] = useState(null);

    useEffect(() => {
        refreshData();
    }, []);

    const handleAcceptOrder = async (orderId) => {
        if (!currentLocation) {
            alert('Location is required to accept orders');
            return;
        }

        setProcessingOrder(orderId);
        const result = await acceptOrder(orderId, currentLocation);
        setProcessingOrder(null);

        if (result.success) {
            setActiveTab('active');
        }
    };

    const handleDeclineOrder = async (orderId) => {
        const reason = prompt('Please provide a reason for declining this order:', 'Unable to reach location');
        if (!reason) return;

        setProcessingOrder(orderId);
        const result = await declineOrder(orderId, reason);
        setProcessingOrder(null);

        if (result.success) {
            alert('Order declined successfully');
        } else {
            alert(result.message);
        }
    };

    const handleMarkPickedUp = async (orderId) => {
        setProcessingOrder(orderId);
        const result = await markPickedUp(orderId);
        setProcessingOrder(null);

        if (result.success) {
            alert('Order marked as picked up successfully!');
        } else {
            alert(result.message);
        }
    };

    const handleMarkDelivered = async (orderId) => {
        setProcessingOrder(orderId);
        const result = await markDelivered(orderId);
        setProcessingOrder(null);

        if (result.success) {
            alert(`Order delivered! You earned ₹${result.earnings || 30}`);
        } else {
            alert(result.message);
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

    const getNextAction = (order) => {
        switch (order.status) {
            case 'assigned':
                return {
                    text: 'Mark as Picked Up',
                    action: () => handleMarkPickedUp(order._id),
                    color: 'primary'
                };
            case 'picked_up':
            case 'in_transit':
                return {
                    text: 'Mark as Delivered',
                    action: () => handleMarkDelivered(order._id),
                    color: 'success'
                };
            default:
                return null;
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading orders..." />;
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <button
                        className="btn btn-secondary"
                        onClick={refreshData}
                        disabled={loading}
                    >
                        🔄 Refresh
                    </button>
                </div>

                {error && (
                    <div className="error-banner">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                        <button
                            className="btn btn-sm"
                            onClick={refreshData}
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="orders-tabs">
                    <button
                        className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
                        onClick={() => setActiveTab('available')}
                    >
                        Available Orders
                        <span className="tab-badge">{availableOrders.length}</span>
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active Deliveries
                        <span className="tab-badge">{activeDeliveries.length}</span>
                    </button>
                </div>

                <div className="orders-content">
                    {activeTab === 'available' && (
                        <div className="orders-section">
                            {availableOrders.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">📦</span>
                                    <h3>No Available Orders</h3>
                                    <p>New orders will appear here when available</p>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {availableOrders.map(order => (
                                        <div key={order._id} className="order-card available">
                                            <div className="order-header">
                                                <span className="order-id">#{order._id.slice(-6)}</span>
                                                <span className="earning">₹30</span>
                                            </div>

                                            <div className="order-info">
                                                <div className="customer-section">
                                                    <h4>👤 {order.customer?.name || 'Customer'}</h4>
                                                    <p>📞 {order.customer?.phone || 'No phone'}</p>
                                                </div>

                                                <div className="address-section">
                                                    <h5>📍 Delivery Address:</h5>
                                                    <p>{order.deliveryAddress}</p>
                                                </div>

                                                <div className="order-details">
                                                    <div className="detail-item">
                                                        <span className="label">Items:</span>
                                                        <span className="value">{order.items?.length || 0} items</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Total:</span>
                                                        <span className="value">₹{order.totalAmount}</span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Distance:</span>
                                                        <span className="value">
                                                            {order.distance ? `${order.distance.toFixed(1)} km` : `${(Math.random() * 5 + 1).toFixed(1)} km`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="order-actions">
                                                <button
                                                    className="btn btn-success btn-half"
                                                    onClick={() => handleAcceptOrder(order._id)}
                                                    disabled={processingOrder === order._id}
                                                >
                                                    {processingOrder === order._id ? (
                                                        <>
                                                            <LoadingSpinner size="small" />
                                                            Accepting...
                                                        </>
                                                    ) : (
                                                        'Accept'
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-half"
                                                    onClick={() => handleDeclineOrder(order._id)}
                                                    disabled={processingOrder === order._id}
                                                >
                                                    {processingOrder === order._id ? (
                                                        <>
                                                            <LoadingSpinner size="small" />
                                                            Declining...
                                                        </>
                                                    ) : (
                                                        'Decline'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'active' && (
                        <div className="orders-section">
                            {activeDeliveries.length === 0 ? (
                                <div className="empty-state">
                                    <span className="empty-icon">🎯</span>
                                    <h3>No Active Deliveries</h3>
                                    <p>Accept orders to start delivering</p>
                                </div>
                            ) : (
                                <div className="orders-grid">
                                    {activeDeliveries.map(order => {
                                        const nextAction = getNextAction(order);
                                        return (
                                            <div key={order._id} className="order-card active">
                                                <div className="order-header">
                                                    <span className="order-id">#{order._id.slice(-6)}</span>
                                                    <span
                                                        className="status-badge"
                                                        style={{ backgroundColor: getStatusColor(order.status) }}
                                                    >
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="order-info">
                                                    <div className="customer-section">
                                                        <h4>👤 {order.customer?.name || 'Customer'}</h4>
                                                        <p>📞 {order.customer?.phone || 'No phone'}</p>
                                                    </div>

                                                    <div className="address-section">
                                                        <h5>📍 Delivery Address:</h5>
                                                        <p>{order.deliveryAddress}</p>
                                                    </div>

                                                    <div className="order-details">
                                                        <div className="detail-item">
                                                            <span className="label">Items:</span>
                                                            <span className="value">{order.items?.length || 0} items</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Total:</span>
                                                            <span className="value">₹{order.totalAmount}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Earning:</span>
                                                            <span className="value earning-highlight">₹30</span>
                                                        </div>
                                                    </div>

                                                    {order.assignedAt && (
                                                        <div className="timestamp">
                                                            <span className="label">Assigned:</span>
                                                            <span className="value">
                                                                {new Date(order.assignedAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="order-actions">
                                                    <Link
                                                        to={`/orders/${order._id}`}
                                                        className="btn btn-outline btn-half"
                                                    >
                                                        View Details
                                                    </Link>

                                                    {nextAction && (
                                                        <button
                                                            className={`btn btn-${nextAction.color} btn-half`}
                                                            onClick={nextAction.action}
                                                            disabled={processingOrder === order._id}
                                                        >
                                                            {processingOrder === order._id ? (
                                                                <>
                                                                    <LoadingSpinner size="small" />
                                                                    Processing...
                                                                </>
                                                            ) : (
                                                                nextAction.text
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}