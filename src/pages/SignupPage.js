import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaCheckCircle,
    FaTimesCircle
} from 'react-icons/fa';
import './SignupPage.css';

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
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    // Password strength validation
    useEffect(() => {
        const { password } = form;
        setPasswordStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        });
    }, [form.password]);

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

        // Validate password match
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Check password strength
        const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
        if (!isPasswordStrong) {
            setError('Password does not meet strength requirements');
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
        <div className="signup-container">
            <div className="signup-wrapper">
                <div className="signup-header">
                    <h2>Delivery Boy Signup</h2>
                    <p>Create your account to get started</p>
                </div>

                <form onSubmit={handleSignup} className="signup-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaUser className="input-icon" />
                            <input
                                name="name"
                                placeholder="Full Name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('password')}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className="password-strength">
                        <div className={`strength-item ${passwordStrength.length ? 'valid' : ''}`}>
                            {passwordStrength.length ? <FaCheckCircle /> : <FaTimesCircle />}
                            At least 8 characters
                        </div>
                        <div className={`strength-item ${passwordStrength.uppercase ? 'valid' : ''}`}>
                            {passwordStrength.uppercase ? <FaCheckCircle /> : <FaTimesCircle />}
                            One uppercase letter
                        </div>
                        <div className={`strength-item ${passwordStrength.lowercase ? 'valid' : ''}`}>
                            {passwordStrength.lowercase ? <FaCheckCircle /> : <FaTimesCircle />}
                            One lowercase letter
                        </div>
                        <div className={`strength-item ${passwordStrength.number ? 'valid' : ''}`}>
                            {passwordStrength.number ? <FaCheckCircle /> : <FaTimesCircle />}
                            One number
                        </div>
                        <div className={`strength-item ${passwordStrength.specialChar ? 'valid' : ''}`}>
                            {passwordStrength.specialChar ? <FaCheckCircle /> : <FaTimesCircle />}
                            One special character
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="input-wrapper">
                            <FaLock className="input-icon" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                required
                                className="form-control"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => togglePasswordVisibility('confirmPassword')}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="signup-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div className="login-link">
                        Already have an account?
                        <Link to="/login"> Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;