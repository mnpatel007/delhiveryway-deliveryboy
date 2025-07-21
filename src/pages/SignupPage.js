import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash
} from 'react-icons/fa';

const SignupPage = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Clear error when form changes
    useEffect(() => {
        setError('');
    }, [form]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prevForm => ({
            ...prevForm,
            [name]: value
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // Basic validation
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Basic password strength check
        if (form.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { confirmPassword, ...signupData } = form;
            const res = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/delivery/auth/signup`,
                signupData
            );

            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-wrapper">
                <div className="auth-header">
                    <h2>Delivery Boy Signup</h2>
                    <p>Create your account</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('password')}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            className="form-input"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="auth-footer">
                        Already have an account?
                        <Link to="/login"> Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;