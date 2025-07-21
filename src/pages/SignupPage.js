import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/delivery/auth/signup`, form);
            login(res.data);
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Signup failed');
        }
    };

    return (
        <form onSubmit={handleSignup}>
            <h2>Delivery Boy Signup</h2>
            <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <button type="submit">Signup</button>
        </form>
    );
};

export default SignupPage;
