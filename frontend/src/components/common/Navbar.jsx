import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp, LayoutDashboard, User, Shield, LogOut, Sun, Moon, Star, DollarSign } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, show: true },
        { to: '/portfolio', label: 'Portfolio', icon: <User className="h-4 w-4" />, show: user && user.role === 'user' },
        { to: '/admin', label: 'Admin', icon: <Shield className="h-4 w-4" />, show: user && user.role === 'admin' },
    ];

    return (
        <nav className="glass sticky top-4 mx-4 z-50 rounded-3xl mb-8 border-primary-500/5">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 group">
                    <div className="bg-primary-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-primary-500/20">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter">STOCK<span className="text-primary-600">UP</span></span>
                </Link>

                <div className="hidden md:flex items-center space-x-1">
                    {navLinks.filter(l => l.show).map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="flex items-center space-x-4">
                    {user && user.role === 'user' && (
                        <div className="flex items-center space-x-2">
                             <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-2xl space-x-2 border border-blue-500/10 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                                <DollarSign className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-black text-blue-600">${user.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-2xl space-x-2 border border-yellow-500/10">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-black text-yellow-600">{user.watchlist?.length || 0}</span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={toggleDarkMode}
                        className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary-600 rounded-2xl transition-all shadow-inner"
                    >
                        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-800 hidden sm:block"></div>

                    <div className="flex items-center space-x-3 group cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black leading-none">{user?.username}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-3 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
