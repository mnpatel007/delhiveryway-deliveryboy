import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import './SignupPage.css';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        vehicleType: 'bike',
        vehicleNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { signup, loading, error, setError } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(null);
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all required fields');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
            setError('Please enter a valid 10-digit phone number');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const { confirmPassword, ...signupData } = formData;
        const result = await signup(signupData);

        if (result.success) {
            navigate('/dashboard');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="signup-page">
            <div className="signup-container">
                <div className="signup-card">
                    <div className="signup-header">
                        <div className="logo">
                            <span className="logo-icon">🚚</span>
                            <span className="logo-text">DeliveryWay</span>
                        </div>
                        <h1>Join as Delivery Partner</h1>
                        <p>Start earning by delivering orders in your area</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name *</label>
                                <div className="input-container">
                                    <span className="input-icon">👤</span>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        autoComplete="name"
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
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="password">Password *</label>
                                <div className="input-container">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        placeholder="Create password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={togglePasswordVisibility}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password *</label>
                                <div className="input-container">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={toggleConfirmPasswordVisibility}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <div className="input-container">
                                    <span className="input-icon">📱</span>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        autoComplete="tel"
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
                        </div>

                        <div className="form-group">
                            <label htmlFor="vehicleNumber">Vehicle Number</label>
                            <div className="input-container">
                                <span className="input-icon">🔢</span>
                                <input
                                    type="text"
                                    id="vehicleNumber"
                                    name="vehicleNumber"
                                    placeholder="Enter vehicle number (optional)"
                                    value={formData.vehicleNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="signup-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <span className="button-icon">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="signup-footer">
                        <p>
                            Already have an account?
                            <Link to="/login" className="login-link">
                                Sign In
                            </Link>
                        </p>

                        <div className="benefits">
                            <h4>Why join DeliveryWay?</h4>
                            <div className="benefit-list">
                                <div className="benefit">
                                    <span className="benefit-icon">💰</span>
                                    <span>Earn ₹30 per delivery + tips</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">⏰</span>
                                    <span>Flexible working hours</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">📍</span>
                                    <span>Work in your local area</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">📱</span>
                                    <span>Easy-to-use mobile app</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
