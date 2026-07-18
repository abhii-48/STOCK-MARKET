import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Star, ChevronRight, Settings, X, Plus, Code, SlidersHorizontal, Triangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_STOCKS = [
    { symbol: 'IDEA.NS', exchange: 'NSE', price: 13.65, changePercent: 6.14, changeAbs: 0.79 },
    { symbol: 'JIOFIN.NS', exchange: 'NSE', price: 234.76, changePercent: 0.92, changeAbs: 2.13 },
    { symbol: 'SUZLON.NS', exchange: 'NSE', price: 53.51, changePercent: 0.49, changeAbs: 0.26 },
    { symbol: 'TATASTEEL.NS', exchange: 'NSE', price: 210.80, changePercent: 0.52, changeAbs: 1.09 },
    { symbol: 'NTPC.NS', exchange: 'NSE', price: 389.80, changePercent: 0.39, changeAbs: 1.50 },
    { symbol: 'IRFC.NS', exchange: 'NSE', price: 97.81, changePercent: 0.15, changeAbs: 0.15 },
    { symbol: 'YESBANK.NS', exchange: 'NSE', price: 22.01, changePercent: 0.92, changeAbs: 0.20 },
    { symbol: 'ONGC.NS', exchange: 'NSE', price: 296.00, changePercent: -0.40, changeAbs: -1.20 },
    { symbol: 'TATAPOWER.NS', exchange: 'NSE', price: 415.90, changePercent: 2.86, changeAbs: 11.55 },
    { symbol: 'IREDA.NS', exchange: 'NSE', price: 128.25, changePercent: 1.05, changeAbs: 1.33 }
];

const WatchlistSidebar = () => {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const { symbol } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchWatchlist();
    }, [user?.watchlist]);

    const fetchWatchlist = async () => {
        try {
            const userWatchlist = user?.watchlist || [];
            if (userWatchlist.length === 0) {
                // Fetch live quotes for default stocks
                const defaultStocksWithQuotes = await Promise.all(
                    DEFAULT_STOCKS.map(async (stock) => {
                        try {
                            const quoteRes = await api.get(`/stocks/quote/${stock.symbol}`);
                            return { ...stock, ...quoteRes.data, changeAbs: quoteRes.data.change };
                        } catch {
                            return stock;
                        }
                    })
                );
                setWatchlist(defaultStocksWithQuotes);
                setLoading(false);
                return;
            }

            const stocksWithQuotes = await Promise.all(
                userWatchlist.map(async (stock) => {
                    try {
                        const quoteRes = await api.get(`/stocks/quote/${stock.symbol}`);
                        return { ...stock, ...quoteRes.data, changeAbs: quoteRes.data.change, exchange: 'NSE' };
                    } catch {
                        return { ...stock, price: 0, changePercent: 0, changeAbs: 0, exchange: 'NSE' };
                    }
                })
            );
            setWatchlist(stocksWithQuotes);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            setWatchlist(DEFAULT_STOCKS);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/stock/${search.toUpperCase()}`);
            setSearch('');
        }
    };

    return (
        <div className="w-[340px] h-full flex flex-col bg-white dark:bg-[#0a0f1d] border-r border-slate-200 dark:border-slate-800 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-[15px] text-slate-800 dark:text-slate-200 tracking-tight">Watchlist</span>
                <div className="flex items-center space-x-4 text-slate-500">
                    <Settings className="w-4 h-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors" />
                    <X className="w-5 h-5 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 transition-colors border-l border-slate-200 dark:border-slate-800 pl-3" />
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-between px-4 pt-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex space-x-4 border-b-[2.5px] border-[#3b82f6]">
                    <button className="text-[#3b82f6] font-semibold text-[13px] pb-2 whitespace-nowrap">mywatchlist</button>
                </div>
                <div className="flex items-center space-x-2 pb-2">
                    <button className="p-1 rounded bg-[#f1f5f9] dark:bg-slate-800 text-[#3b82f6] hover:bg-[#e2e8f0] dark:hover:bg-slate-700 transition-colors">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                    <button className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Code className="w-3.5 h-3.5 transform rotate-90" />
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-3 bg-[#f8fafc] dark:bg-[#0a0f1d] border-b border-slate-200 dark:border-slate-800">
                <form onSubmit={handleSearch} className="relative group flex items-center">
                    <div className="relative w-full flex items-center bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">
                        <Search className="absolute left-3 w-4 h-4 text-slate-400 group-focus-within:text-[#3b82f6] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-full pl-9 pr-10 py-2 bg-transparent text-[13px] focus:outline-none placeholder-slate-400 font-medium text-slate-700 dark:text-slate-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <SlidersHorizontal className="absolute right-3 w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 border-l border-slate-200 dark:border-slate-700 pl-1" />
                    </div>
                </form>
            </div>

            {/* Watchlist Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-[#f8fafc] dark:bg-[#0a0f1d]">
                {loading ? (
                    <div className="p-8 text-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#0a0f1d]">
                        {watchlist.map((stock, index) => {
                            const isPositive = stock.changePercent >= 0;
                            const isActive = symbol?.toUpperCase() === stock.symbol.toUpperCase();
                            const changeAbs = stock.changeAbs !== undefined ? stock.changeAbs : (stock.price * (stock.changePercent / 100));
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={stock.symbol}
                                    onClick={() => navigate(`/stock/${stock.symbol}`)}
                                    className={`px-4 py-3 flex items-center justify-between cursor-pointer border-b border-slate-100 dark:border-slate-800/50 transition-colors ${isActive ? 'bg-[#f1f5f9] dark:bg-slate-800' : isEven ? 'bg-white dark:bg-[#0a0f1d]' : 'bg-[#f8fafc] dark:bg-slate-900/20'} hover:bg-slate-50 dark:hover:bg-slate-800`}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-200">{stock.symbol}</span>
                                            <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">{stock.exchange || 'NSE'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className={`flex items-center text-[13.5px] font-bold ${isPositive ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                                            {(stock.price || 0).toFixed(2)}
                                            {isPositive ? (
                                                <Triangle className="w-[10px] h-[10px] ml-1.5 fill-current" />
                                            ) : (
                                                <Triangle className="w-[10px] h-[10px] ml-1.5 fill-current transform rotate-180" />
                                            )}
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 tracking-tight">
                                            {isPositive ? '+' : ''}{(changeAbs || 0).toFixed(2)} ({isPositive ? '+' : ''}{(stock.changePercent || 0).toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom Footer */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0f1d]">
                <button className="w-full flex items-center justify-between text-[12px] font-bold text-[#3b82f6] uppercase tracking-wide hover:opacity-80 transition-opacity">
                    OPTIONS QUICK LIST
                    <ChevronRight className="w-4 h-4 p-0.5 rounded-full border border-[#3b82f6]/30 bg-[#3b82f6]/5" />
                </button>
            </div>
        </div>
    );
};

export default WatchlistSidebar;
