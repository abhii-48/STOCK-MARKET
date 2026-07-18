import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StockCard = ({ symbol, name }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const { data } = await api.get(`/stocks/quote/${symbol}`);
                setData(data);
            } catch (err) {
                setError(err.response?.data?.message || 'Error');
            }
            setLoading(false);
        };
        fetchQuote();
    }, [symbol]);

    if (loading) return (
        <div className="glass h-40 rounded-3xl animate-pulse bg-slate-50/50 dark:bg-slate-800/50"></div>
    );

    if (!data && !loading) return (
        <div className="glass p-4 rounded-3xl bg-red-50/50 dark:bg-red-900/10 border-red-200">
            <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{symbol}</p>
            <p className="text-[10px] text-red-400 font-medium leading-tight">Data unavailable</p>
        </div>
    );

    const isPositive = data.changePercent >= 0;

    return (
        <Link to={`/stock/${symbol}`} className="glass p-5 rounded-[2rem] group hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-40 border-slate-100/50 dark:border-slate-800/50">
            <div className={`absolute -right-10 -top-10 w-24 h-24 ${isPositive ? 'bg-green-500/5' : 'bg-red-500/5'} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000`}></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-0.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-primary-500 transition-colors">{symbol}</span>
                    <h3 className="text-sm font-black truncate max-w-[140px] leading-tight group-hover:translate-x-1 transition-transform">{name || symbol}</h3>
                </div>
                <div className={`p-2 rounded-xl backdrop-blur-md ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
            </div>

            <div className="flex items-end justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-2xl font-black tracking-tighter">${(data.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <div className={`flex items-center text-[11px] font-bold px-2 py-0.5 rounded-lg inline-flex ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {isPositive ? '+' : ''}{Math.abs(data.change || 0).toFixed(2)} ({Math.abs(data.changePercent || 0).toFixed(2)}%)
                    </div>
                </div>
                <div className="p-2 bg-primary-600 rounded-xl text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-lg shadow-primary-600/30">
                    <ArrowUpRight className="h-4 w-4" />
                </div>
            </div>
        </Link>
    );
};


export default StockCard;
