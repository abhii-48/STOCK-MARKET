import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Activity } from 'lucide-react';
import api from '../services/api';
import TransactionTable from '../components/trading/TransactionTable';

const AdminPanelPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [users, setUsers] = useState([]);
    const [fundAmount, setFundAmount] = useState({});

    useEffect(() => {
        fetchTransactions();
        fetchUsers();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/transactions/all');
            setTransactions(data);
        } catch (err) { }
        setLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) { }
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/transactions/${id}`, { status });
            setTransactions(transactions.map(t => t._id === id ? { ...t, status } : t));
        } catch (err) { }
    };

    const handleAdminFundUpdate = async (userId, type) => {
        const amount = fundAmount[userId];
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        try {
            const { data } = await api.put(`/users/${userId}/funds`, { amount, type });
            setUsers(users.map(u => u._id === userId ? { ...u, balance: data.balance } : u));
            setFundAmount({ ...fundAmount, [userId]: '' });
            alert(`Successfully updated funds for user`);
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-primary-600 font-black uppercase tracking-widest text-xs">
                        <Shield className="h-4 w-4" />
                        <span>Security Level: Administrator</span>
                    </div>
                    <h1 className="text-4xl font-black">Control Center</h1>
                </div>
                <div className="flex space-x-4">
                    <div className="glass px-6 py-3 rounded-2xl flex items-center space-x-3">
                        <Users className="h-5 w-5 text-slate-400" />
                        <span className="font-bold text-sm">Active Orders: {transactions.filter(t => t.status === 'pending').length}</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <section className="xl:col-span-2 glass rounded-3xl overflow-hidden shadow-2xl border-primary-500/10 border h-fit">
                    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                        <Activity className="h-5 w-5 text-primary-600" />
                        <h2 className="text-xl font-bold italic">Global Transaction Feed</h2>
                    </div>
                    <TransactionTable transactions={transactions} isAdmin={true} onAction={handleAction} />
                </section>

                <section className="glass rounded-3xl overflow-hidden shadow-2xl border-primary-500/10 border h-fit">
                    <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3">
                        <Users className="h-5 w-5 text-primary-600" />
                        <h2 className="text-xl font-bold italic">Market Users</h2>
                    </div>
                    <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                        {users.map(u => (
                            <div key={u._id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white capitalize">{u.username}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{u.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</p>
                                        <p className="text-sm font-black text-primary-600">${u.balance?.toFixed(2) || '0.00'}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                    <input
                                        type="number"
                                        className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl outline-none text-xs font-bold"
                                        placeholder="Amt"
                                        value={fundAmount[u._id] || ''}
                                        onChange={(e) => setFundAmount({ ...fundAmount, [u._id]: e.target.value })}
                                    />
                                    <button
                                        onClick={() => handleAdminFundUpdate(u._id, 'add')}
                                        className="flex-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black py-2 rounded-xl transition-all active:scale-95"
                                    >
                                        ADD
                                    </button>
                                    <button
                                        onClick={() => handleAdminFundUpdate(u._id, 'withdraw')}
                                        className="flex-1 bg-slate-800 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white text-[10px] font-black py-2 rounded-xl transition-all active:scale-95"
                                    >
                                        WITHDRAW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminPanelPage;
