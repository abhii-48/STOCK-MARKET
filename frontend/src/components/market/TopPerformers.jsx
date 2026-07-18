import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import api from '../../services/api';

const PerformerCard = ({ symbol }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            try {
                const { data } = await api.get(`/stocks/quote/${symbol}`);
                setData(data);
            } catch (error) {
                console.error(`Error fetching ${symbol}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchQuote();
    }, [symbol]);

    if (loading) return (
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 h-40 animate-pulse bg-slate-50/50 dark:bg-slate-900/50"></div>
    );

    if (!data) return null;

    const isPositive = data.change >= 0;

    return (
        <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:shadow-xl transition-all cursor-pointer bg-white/50 dark:bg-slate-900/50 flex flex-col justify-between h-40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
                <span className={`inline-block px-2 py-1 rounded text-xs font-black ${isPositive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
                </span>
            </div>
            <div className="flex items-start space-x-3 mt-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {symbol.substring(0, 2)}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{symbol}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{data.name}</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                <span className="text-sm font-black">₹{data.price.toLocaleString()}</span>
                <span className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}
                </span>
            </div>
        </div>
    );
};

const TopPerformers = () => {
    const timeframes = ['1 Week', '1 Month', '1 Year', '5 Year'];
    const [activeTimeframe, setActiveTimeframe] = useState('1 Week');
    const symbols = ['TATACONSUM.NS', 'PIDILITIND.NS', 'HINDZINC.NS', 'MOTHERSON.NS'];

    return (
        <div className="glass p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight">Top Performers</h2>
                <button className="text-xs font-bold text-primary-600 flex items-center hover:underline">
                    VIEW ALL <ChevronRight className="h-4 w-4 ml-1" />
                </button>
            </div>

            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex space-x-6">
                    {timeframes.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setActiveTimeframe(tf)}
                            className={`text-sm font-bold pb-4 -mb-4 transition-all border-b-2 ${activeTimeframe === tf ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
                {symbols.map((symbol) => (
                    <PerformerCard key={symbol} symbol={symbol} />
                ))}
            </div>
        </div>
    );
};

export default TopPerformers;
