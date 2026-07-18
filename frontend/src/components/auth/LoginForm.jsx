import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

// BUG FIX: Added `loading` prop to disable the button during submission,
// preventing double-submit race conditions
const LoginForm = ({ onSubmit, error, loading = false }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return; // Guard against double-submit
        onSubmit(email, password);
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" /> {error}
                </div>
            )}
            <div className="space-y-4">
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium disabled:opacity-60"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        autoComplete="email"
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium disabled:opacity-60"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        autoComplete="current-password"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-primary-600 hover:bg-primary-700 shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> SIGNING IN...
                    </>
                ) : (
                    <>
                        <LogIn className="h-4 w-4 mr-2" /> SIGN IN
                    </>
                )}
            </button>
        </form>
    );
};

export default LoginForm;
