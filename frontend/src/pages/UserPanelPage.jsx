import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, DollarSign, Clock } from 'lucide-react';
import api from '../services/api';
import TransactionTable from '../components/trading/TransactionTable';

const UserPanelPage = () => {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [fundAmount, setFundAmount] = useState('');
    const [fundError, setFundError] = useState('');
    const { setUser } = useAuth();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/transactions/my');
            setTransactions(data);
        } catch (err) { }
        setLoading(false);
    };

    const handleFundUpdate = async (type) => {
        if (!fundAmount || isNaN(fundAmount) || Number(fundAmount) <= 0) {
            setFundError('Please enter a valid amount');
            return;
        }
        try {
            const { data } = await api.put('/users/profile/funds', { amount: fundAmount, type });
            setUser(prev => ({ ...prev, balance: data.balance }));
            setFundAmount('');
            setFundError('');
            alert(`Successfully ${type === 'add' ? 'added' : 'withdrawn'} $${fundAmount}`);
        } catch (err) {
            setFundError(err.response?.data?.message || 'Fund update failed');
        }
    };

    const stats = transactions.reduce((acc, t) => {
        if (t.status === 'approved') {
            acc.total += t.total;
        } else if (t.status === 'pending') {
            acc.pending++;
        }
        return acc;
    }, { total: 0, pending: 0 });

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between space-y-4 md:space-y-0">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black">My Portfolio</h1>
                    <p className="text-slate-500 font-medium">Overview of your market activities and holdings.</p>
                </div>
                <div className="glass p-6 rounded-3xl flex items-center space-x-4 border-primary-500/20 border">
                    <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                        <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                        <p className="text-2xl font-black text-primary-600">${user?.balance?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 h-fit">
                    {[
                        { label: 'Total Invested', val: `$${stats.total.toFixed(2)}`, icon: <DollarSign />, color: 'text-primary-600' },
                        { label: 'Pending Requests', val: stats.pending, icon: <Clock />, color: 'text-orange-500' },
                        { label: 'Active Holdings', val: [...new Set(transactions.filter(t => t.status === 'approved').map(t => t.symbol))].length, icon: <TrendingUp />, color: 'text-green-500' }
                    ].map((stat, i) => (
                        <div key={i} className="glass p-6 rounded-3xl flex flex-col justify-between items-start">
                            <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm ${stat.color} mb-4`}>
                                {React.cloneElement(stat.icon, { className: 'h-5 w-5' })}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase mb-1">{stat.label}</p>
                                <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass p-8 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black">Manage Funds</h2>
                        {fundError && <span className="text-red-500 text-xs font-bold">{fundError}</span>}
                    </div>
                    <div className="relative group">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="number"
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-bold"
                            placeholder="Enter Amount"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleFundUpdate('add')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center space-x-2"
                        >
                            <span>ADD FUNDS</span>
                        </button>
                        <button
                            onClick={() => handleFundUpdate('withdraw')}
                            className="flex-1 bg-slate-800 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center space-x-2"
                        >
                            <span>WITHDRAW</span>
                        </button>
                    </div>
                </div>
            </div>

            <section className="glass rounded-3xl overflow-hidden shadow-xl border-primary-500/5 border">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold italic tracking-tight">Recent Activity Feed</h2>
                    <span className="px-4 py-1.5 bg-primary-500 text-[10px] font-black rounded-full text-white uppercase tracking-widest shadow-lg shadow-primary-500/20">Portfolio Live</span>
                </div>

                <TransactionTable transactions={transactions} />

                {transactions.length === 0 && (
                    <div className="py-20 text-center text-slate-400 font-medium italic">No transactions found. Start trading today!</div>
                )}
            </section>
        </div>
    );
};

export default UserPanelPage;
