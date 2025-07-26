import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilePage.css';

export default function ProfilePage() {
    const { deliveryBoy, updateProfile, loading, error, setError } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: deliveryBoy?.name || '',
        email: deliveryBoy?.email || '',
        phone: deliveryBoy?.phone || '',
        vehicleType: deliveryBoy?.vehicleType || 'bike',
        vehicleNumber: deliveryBoy?.vehicleNumber || ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            setError('Name and email are required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setUpdateLoading(true);
        const result = await updateProfile(formData);
        setUpdateLoading(false);

        if (result.success) {
            setIsEditing(false);
            alert('Profile updated successfully!');
        }
    };

    const handleCancel = () => {
        setFormData({
            name: deliveryBoy?.name || '',
            email: deliveryBoy?.email || '',
            phone: deliveryBoy?.phone || '',
            vehicleType: deliveryBoy?.vehicleType || 'bike',
            vehicleNumber: deliveryBoy?.vehicleNumber || ''
        });
        setIsEditing(false);
        setError(null);
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getVehicleIcon = (vehicleType) => {
        switch (vehicleType) {
            case 'bike': return '🏍️';
            case 'scooter': return '🛵';
            case 'bicycle': return '🚲';
            case 'car': return '🚗';
            default: return '🏍️';
        }
    };

    if (loading) {
        return <LoadingSpinner message="Loading profile..." />;
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    {!isEditing && (
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                <div className="profile-content">
                    {/* Profile Card */}
                    <div className="profile-card">
                        <div className="profile-avatar">
                            <div className="avatar-circle">
                                {getInitials(deliveryBoy?.name || 'User')}
                            </div>
                            <div className="online-status">
                                <span className={`status-dot ${deliveryBoy?.isOnline ? 'online' : 'offline'}`}></span>
                                <span className="status-text">
                                    {deliveryBoy?.isOnline ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className="profile-form">
                                <div className="form-group">
                                    <label htmlFor="name">Full Name *</label>
                                    <div className="input-container">
                                        <span className="input-icon">👤</span>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email Address *</label>
                                    <div className="input-container">
                                        <span className="input-icon">📧</span>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <div className="input-container">
                                        <span className="input-icon">📱</span>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="vehicleType">Vehicle Type</label>
                                    <div className="input-container">
                                        <span className="input-icon">🏍️</span>
                                        <select
                                            id="vehicleType"
                                            name="vehicleType"
                                            value={formData.vehicleType}
                                            onChange={handleChange}
                                        >
                                            <option value="bike">Bike</option>
                                            <option value="scooter">Scooter</option>
                                            <option value="bicycle">Bicycle</option>
                                            <option value="car">Car</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="vehicleNumber">Vehicle Number</label>
                                    <div className="input-container">
                                        <span className="input-icon">🔢</span>
                                        <input
                                            type="text"
                                            id="vehicleNumber"
                                            name="vehicleNumber"
                                            value={formData.vehicleNumber}
                                            onChange={handleChange}
                                            placeholder="Enter vehicle number"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <span className="error-icon">⚠️</span>
                                        {error}
                                    </div>
                                )}

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={handleCancel}
                                        disabled={updateLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={updateLoading}
                                    >
                                        {updateLoading ? (
                                            <>
                                                <LoadingSpinner size="small" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="profile-info">
                                <div className="info-group">
                                    <div className="info-item">
                                        <span className="info-icon">👤</span>
                                        <div className="info-content">
                                            <label>Full Name</label>
                                            <value>{deliveryBoy?.name || 'Not provided'}</value>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">📧</span>
                                        <div className="info-content">
                                            <label>Email Address</label>
                                            <value>{deliveryBoy?.email || 'Not provided'}</value>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">📱</span>
                                        <div className="info-content">
                                            <label>Phone Number</label>
                                            <value>{deliveryBoy?.phone || 'Not provided'}</value>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">{getVehicleIcon(deliveryBoy?.vehicleType)}</span>
                                        <div className="info-content">
                                            <label>Vehicle Type</label>
                                            <value>{deliveryBoy?.vehicleType || 'Not provided'}</value>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <span className="info-icon">🔢</span>
                                        <div className="info-content">
                                            <label>Vehicle Number</label>
                                            <value>{deliveryBoy?.vehicleNumber || 'Not provided'}</value>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Account Stats */}
                    <div className="stats-section">
                        <h2>Account Statistics</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-content">
                                    <h3>Member Since</h3>
                                    <p>{deliveryBoy?.createdAt ? new Date(deliveryBoy.createdAt).toLocaleDateString() : 'Unknown'}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">⭐</div>
                                <div className="stat-content">
                                    <h3>Rating</h3>
                                    <p>{deliveryBoy?.rating ? `${deliveryBoy.rating.toFixed(1)} / 5.0` : 'No ratings yet'}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-content">
                                    <h3>Status</h3>
                                    <p className={deliveryBoy?.isOnline ? 'status-online' : 'status-offline'}>
                                        {deliveryBoy?.isOnline ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Actions */}
                    <div className="actions-section">
                        <h2>Account Actions</h2>
                        <div className="actions-grid">
                            <button className="action-card">
                                <div className="action-icon">🔒</div>
                                <div className="action-content">
                                    <h4>Change Password</h4>
                                    <p>Update your account password</p>
                                </div>
                            </button>

                            <button className="action-card">
                                <div className="action-icon">🔔</div>
                                <div className="action-content">
                                    <h4>Notification Settings</h4>
                                    <p>Manage your notification preferences</p>
                                </div>
                            </button>

                            <button className="action-card">
                                <div className="action-icon">❓</div>
                                <div className="action-content">
                                    <h4>Help & Support</h4>
                                    <p>Get help with your account</p>
                                </div>
                            </button>

                            <button className="action-card">
                                <div className="action-icon">📄</div>
                                <div className="action-content">
                                    <h4>Terms & Privacy</h4>
                                    <p>View terms and privacy policy</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}