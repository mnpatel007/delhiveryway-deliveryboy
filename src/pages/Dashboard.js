import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_BACKEND_URL);

const Dashboard = () => {
    const { deliveryBoy, logout } = useContext(AuthContext);
    const [assigned, setAssigned] = useState(null);
    const [pendingPopup, setPendingPopup] = useState(null);

    useEffect(() => {
        if (deliveryBoy) {
            console.log('✅ Registering delivery boy to socket room...');
            socket.emit('registerDelivery', deliveryBoy.deliveryBoy._id);
        }

        socket.on('newDeliveryAssignment', (payload) => {
            console.log('📦 Received newDeliveryAssignment payload:', payload);
            if (!assigned) {
                setPendingPopup(payload);
            } else {
                console.log('🟡 Ignored because already assigned');
            }
        });

        return () => {
            socket.off('newDeliveryAssignment');
        };
    }, [deliveryBoy, assigned]);

    const handleAccept = () => {
        console.log('🟢 Accepted delivery:', pendingPopup);
        setAssigned(pendingPopup);
        setPendingPopup(null);
    };

    return (
        <div>
            <h2>Welcome, {deliveryBoy?.deliveryBoy?.name}</h2>
            <button onClick={logout}>Logout</button>

            {pendingPopup && !assigned && (
                <div className="modal" style={{ border: '1px solid black', padding: '10px', margin: '20px', background: '#f8f8f8' }}>
                    <h3>🚨 New Delivery Assignment</h3>
                    <p><strong>Earn:</strong> ₹{pendingPopup.earnAmount}</p>
                    <p><strong>To:</strong> {pendingPopup.address}</p>
                    <p><strong>Items:</strong> {pendingPopup.items.length}</p>
                    <button onClick={handleAccept}>Accept Delivery</button>
                </div>
            )}

            {assigned && (
                <div style={{ marginTop: '20px' }}>
                    <h3>📦 Assigned Delivery</h3>
                    <p><strong>Address:</strong> {assigned.address}</p>
                    <p><strong>Shop:</strong> {assigned.shopDetails?.name}</p>
                    <p><strong>Earn:</strong> ₹{assigned.earnAmount}</p>
                    <ul>
                        {assigned.items.map((item, i) => (
                            <li key={i}>
                                Product ID: {item.productId} × {item.quantity}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Dashboard;