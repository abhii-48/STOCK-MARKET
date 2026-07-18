import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StockCard from '../components/stock/StockCard';
import MarketOverview from '../components/market/MarketOverview';

const DashboardPage = () => {
    const [search, setSearch] = useState('');
    const [trending, setTrending] = useState(['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'SBIN.NS', 'ICICIBANK.NS']);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setWatchlist(data.watchlist || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/stock/${search.toUpperCase()}`);
        }
    };

    return (
        <div className="space-y-10 pb-20 animate-slide-up">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 transition-all duration-700">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <span className="h-6 w-1.5 bg-primary-600 rounded-full"></span>
                        <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">
                            Market <span className="gradient-text">Terminal</span>
                        </h1>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] pl-3.5">
                        Live Data Feed • {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                
                <form onSubmit={handleSearch} className="relative group w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="SEARCH STOCKS (e.g. RELIANCE.NS)" 
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-black text-sm uppercase tracking-widest"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </header>

            <MarketOverview watchlist={watchlist} />
        </div>
    );
};


export default DashboardPage;
