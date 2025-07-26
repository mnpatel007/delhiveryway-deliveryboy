import React, { useContext, useState, useEffect } from 'react';
import { DeliveryContext } from '../context/DeliveryContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './EarningsPage.css';

export default function EarningsPage() {
    const { earnings, fetchEarnings, fetchDeliveryHistory, loading } = useContext(DeliveryContext);
    const [selectedPeriod, setSelectedPeriod] = useState('today');
    const [recentDeliveries, setRecentDeliveries] = useState([]);

    useEffect(() => {
        fetchEarnings();
        fetchDeliveryHistory(1, 10).then(data => {
            if (data?.records) {
                setRecentDeliveries(data.records);
            }
        });
    }, [fetchEarnings, fetchDeliveryHistory]);

    const getEarningsForPeriod = () => {
        switch (selectedPeriod) {
            case 'today':
                return {
                    amount: earnings.todayEarnings,
                    deliveries: earnings.todayDeliveries,
                    label: 'Today'
                };
            case 'week':
                return {
                    amount: earnings.weekEarnings,
                    deliveries: earnings.weekDeliveries,
                    label: 'This Week'
                };
            case 'month':
                return {
                    amount: earnings.monthEarnings,
                    deliveries: earnings.monthDeliveries,
                    label: 'This Month'
                };
            case 'total':
                return {
                    amount: earnings.totalEarnings,
                    deliveries: earnings.totalDeliveries,
                    label: 'All Time'
                };
            default:
                return {
                    amount: 0,
                    deliveries: 0,
                    label: 'Today'
                };
        }
    };

    const currentPeriodData = getEarningsForPeriod();
    const averagePerDelivery = currentPeriodData.deliveries > 0
        ? (currentPeriodData.amount / currentPeriodData.deliveries).toFixed(2)
        : 0;

    if (loading) {
        return <LoadingSpinner message="Loading earnings..." />;
    }

    return (
        <div className="earnings-page">
            <div className="earnings-container">
                <div className="earnings-header">
                    <h1>My Earnings</h1>
                    <div className="period-selector">
                        <button
                            className={`period-btn ${selectedPeriod === 'today' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('today')}
                        >
                            Today
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('week')}
                        >
                            Week
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('month')}
                        >
                            Month
                        </button>
                        <button
                            className={`period-btn ${selectedPeriod === 'total' ? 'active' : ''}`}
                            onClick={() => setSelectedPeriod('total')}
                        >
                            Total
                        </button>
                    </div>
                </div>

                {/* Main Earnings Card */}
                <div className="main-earnings-card">
                    <div className="earnings-display">
                        <div className="earnings-amount">
                            <span className="currency">₹</span>
                            <span className="amount">{currentPeriodData.amount}</span>
                        </div>
                        <div className="earnings-period">{currentPeriodData.label}</div>
                    </div>

                    <div className="earnings-stats">
                        <div className="stat-item">
                            <div className="stat-value">{currentPeriodData.deliveries}</div>
                            <div className="stat-label">Deliveries</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-value">₹{averagePerDelivery}</div>
                            <div className="stat-label">Avg per Delivery</div>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="summary-grid">
                    <div className="summary-card">
                        <div className="summary-icon">💰</div>
                        <div className="summary-content">
                            <h3>₹{earnings.todayEarnings}</h3>
                            <p>Today's Earnings</p>
                            <span className="summary-detail">{earnings.todayDeliveries} deliveries</span>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon">📅</div>
                        <div className="summary-content">
                            <h3>₹{earnings.weekEarnings}</h3>
                            <p>This Week</p>
                            <span className="summary-detail">{earnings.weekDeliveries} deliveries</span>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon">📊</div>
                        <div className="summary-content">
                            <h3>₹{earnings.monthEarnings}</h3>
                            <p>This Month</p>
                            <span className="summary-detail">{earnings.monthDeliveries} deliveries</span>
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-icon">🏆</div>
                        <div className="summary-content">
                            <h3>₹{earnings.totalEarnings}</h3>
                            <p>Total Earned</p>
                            <span className="summary-detail">{earnings.totalDeliveries} deliveries</span>
                        </div>
                    </div>
                </div>

                {/* Recent Deliveries */}
                <div className="recent-deliveries">
                    <div className="section-header">
                        <h2>Recent Deliveries</h2>
                        <span className="section-count">{recentDeliveries.length} recent</span>
                    </div>

                    {recentDeliveries.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-icon">📦</span>
                            <h3>No Deliveries Yet</h3>
                            <p>Your completed deliveries will appear here</p>
                        </div>
                    ) : (
                        <div className="deliveries-list">
                            {recentDeliveries.map(delivery => (
                                <div key={delivery._id} className="delivery-item">
                                    <div className="delivery-info">
                                        <div className="delivery-header">
                                            <span className="order-id">#{delivery._id ? String(delivery._id).slice(-6) : 'N/A'}</span>
                                            <span className="delivery-date">
                                                {new Date(delivery.deliveredAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="delivery-details">
                                            <div className="customer-name">
                                                👤 {delivery.customerName || 'Customer'}
                                            </div>
                                            <div className="delivery-address">
                                                📍 {delivery.deliveryAddress || 'Address not available'}
                                            </div>
                                            <div className="delivery-time">
                                                🕒 {new Date(delivery.deliveredAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="delivery-earning">
                                        <span className="earning-amount">₹{delivery.earnings || 30}</span>
                                        <span className="earning-label">Earned</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Earnings Tips */}
                <div className="earnings-tips">
                    <div className="section-header">
                        <h2>💡 Earning Tips</h2>
                    </div>
                    <div className="tips-grid">
                        <div className="tip-card">
                            <div className="tip-icon">⏰</div>
                            <div className="tip-content">
                                <h4>Peak Hours</h4>
                                <p>Work during lunch (12-2 PM) and dinner (7-10 PM) for more orders</p>
                            </div>
                        </div>
                        <div className="tip-card">
                            <div className="tip-icon">📍</div>
                            <div className="tip-content">
                                <h4>Stay in Busy Areas</h4>
                                <p>Position yourself near restaurants and commercial areas</p>
                            </div>
                        </div>
                        <div className="tip-card">
                            <div className="tip-icon">⚡</div>
                            <div className="tip-content">
                                <h4>Quick Deliveries</h4>
                                <p>Faster deliveries mean more orders and higher earnings</p>
                            </div>
                        </div>
                        <div className="tip-card">
                            <div className="tip-icon">🌟</div>
                            <div className="tip-content">
                                <h4>Customer Service</h4>
                                <p>Good service can lead to tips and positive ratings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}