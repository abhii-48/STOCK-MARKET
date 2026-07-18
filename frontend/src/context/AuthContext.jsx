import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
        } catch (err) {
            // Token is invalid or expired — clear it
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        // BUG FIX: Previously threw a string; now throws a proper Error so
        // callers can reliably inspect err.message
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);

        // BUG FIX: Store only user fields — not the token — for consistency
        // with what fetchProfile() stores on subsequent page loads
        const { token, ...userData } = data;
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
