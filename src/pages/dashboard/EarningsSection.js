import React from 'react';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

export default React.memo(function EarningsSection({ earnings, activeDeliveries }) {
  return (
    <div className="stats-grid">
      <StatCard
        icon="💰"
        label="Today's Earnings"
        value={`₹${earnings.today?.toFixed(2) || '0.00'}`}
        color="#4caf50"
      />
      <StatCard
        icon="📦"
        label="Today's Deliveries"
        value={earnings.todayDeliveries || 0}
        color="#2196f3"
      />
      <StatCard
        icon="🎯"
        label="Active Orders"
        value={activeDeliveries || 0}
        color="#ff9800"
      />
      <StatCard
        icon="📈"
        label="This Week"
        value={`₹${earnings.week?.toFixed(2) || '0.00'}`}
        color="#9c27b0"
      />
    </div>
  );
});