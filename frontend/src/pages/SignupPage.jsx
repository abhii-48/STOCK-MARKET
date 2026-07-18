import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import SignupForm from '../components/auth/SignupForm';

const SignupPage = () => {
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (formData) => {
        try {
            await api.post('/auth/register', formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 glass p-10 rounded-3xl shadow-2xl">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Market Registration</h1>
                    <p className="text-slate-500 font-medium">Join our professional trading network.</p>
                </div>

                <SignupForm onSubmit={handleSubmit} error={error} />

                <div className="text-center mt-6">
                    <p className="text-slate-500 text-sm font-medium">
                        Already registered?{' '}
                        <Link to="/login" className="text-primary-600 font-black hover:underline underline-offset-4">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
