import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, AlertCircle } from 'lucide-react';

const SignupForm = ({ onSubmit, error }) => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" /> {error}
                </div>
            )}
            <div className="space-y-4">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                </div>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="password"
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>
                <div className="flex space-x-4">
                    <label className="flex-1">
                        <input type="radio" value="user" checked={formData.role === 'user'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="hidden" />
                        <div className={`text-center py-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${formData.role === 'user' ? 'border-primary-500 bg-primary-50/10 text-primary-600' : 'border-slate-100 text-slate-400'}`}>User</div>
                    </label>
                    <label className="flex-1">
                        <input type="radio" value="admin" checked={formData.role === 'admin'} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="hidden" />
                        <div className={`text-center py-3 rounded-xl border-2 cursor-pointer font-bold transition-all ${formData.role === 'admin' ? 'border-primary-500 bg-primary-50/10 text-primary-600' : 'border-slate-100 text-slate-400'}`}>Admin</div>
                    </label>
                </div>
            </div>

            <button
                type="submit"
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-primary-600 hover:bg-primary-700 shadow-xl transition-all active:scale-95"
            >
                <UserPlus className="h-4 w-4 mr-2" /> CREATE ACCOUNT
            </button>
        </form>
    );
};

export default SignupForm;
