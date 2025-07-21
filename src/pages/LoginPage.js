import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Clear error when email or password changes
    useEffect(() => {
        setError('');
    }, [email, password]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/delivery/auth/login`,
                { email, password }
            );

            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-header">
                    <h2>Delivery Boy Login</h2>
                    <p>Welcome back! Please login</p>
                </div>

                <form onSubmit={handleLogin} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="form-input"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={togglePasswordVisibility}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="forgot-password">
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging In...' : 'Login'}
                    </button>

                    <div className="auth-footer">
                        Don't have an account?
                        <Link to="/signup"> Sign Up</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;