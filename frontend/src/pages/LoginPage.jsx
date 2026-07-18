import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (email, password) => {
        // BUG FIX: Clear any previous error before a new attempt
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            // BUG FIX: Surface the actual server error message when available
            // Previously always showed a hardcoded generic message
            const message =
                err?.response?.data?.message ||
                (typeof err === 'string' ? err : null) ||
                (err?.code === 'ECONNABORTED'
                    ? 'The server took too long to respond. Please try again.'
                    : 'Cannot connect to the server. Start the backend and try again.');
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 glass p-10 rounded-3xl shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Access Terminal</h1>
                    <p className="text-slate-500 font-medium">Log in to manage your stock portfolio.</p>
                </div>

                <LoginForm onSubmit={handleSubmit} error={error} loading={loading} />

                <div className="text-center mt-6">
                    <p className="text-slate-500 text-sm font-medium">
                        First time here?{' '}
                        <Link to="/signup" className="text-primary-600 font-black hover:underline underline-offset-4">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
