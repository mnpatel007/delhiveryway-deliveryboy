import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const LoginPage = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/delivery/auth/login`,
                { email, password }
            );
            login(res.data); // update context, which already sets token in localStorage
            // localStorage.setItem('token', res.data.token); // REMOVED: Redundant, AuthContext handles this
            localStorage.setItem('user', JSON.stringify(res.data.user)); // optional, if 'user' is needed elsewhere
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="login-background">
            <div className="login-card">
                <h2 className="login-title">Delivery Login</h2>
                <p className="login-subtitle">Access your delivery dashboard</p>

                {error && <div className="login-error">{error}</div>}

                <form className="login-form" onSubmit={handleLogin}>
                    <div className="input-wrapper">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-wrapper">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="forgot-link">
                        <Link to="/forgot-password">Forgot password?</Link>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="switch-link">
                    Don’t have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

