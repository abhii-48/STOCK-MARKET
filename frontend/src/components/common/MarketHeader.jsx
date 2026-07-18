import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import api from '../../services/api';

const MarketHeader = () => {
    const [indices, setIndices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIndices = async () => {
            try {
                const { data } = await api.get('/stocks/indices');
                setIndices(data);
            } catch (err) {
                console.error('Error fetching indices:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchIndices();
        const interval = setInterval(fetchIndices, 60000); // Polling every 1 minute
        return () => clearInterval(interval);
    }, []);

    if (loading && indices.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center space-x-8 overflow-x-auto no-scrollbar animate-pulse">
                <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
                <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
        );
    }

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-4 py-2 flex items-center space-x-8 overflow-x-auto no-scrollbar sticky top-[64px] z-40 transition-all duration-500">
            {indices.map((index) => {
                const isPositive = index.change >= 0;
                return (
                    <div key={index.symbol} className="flex items-center space-x-4 min-w-fit group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 px-3 rounded-xl transition-all duration-300">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary-500 transition-colors">{index.name}</span>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-black tracking-tight">${index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                <div className={`flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                                    {isPositive ? '+' : ''}{index.changePercent.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                        <ChevronDown className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                );
            })}
        </div>
    );
};


export default MarketHeader;
