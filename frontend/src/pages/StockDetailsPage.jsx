import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Star,
    Plus,
    Minus,
    ShoppingCart,
    Clock,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import api from '../services/api';
import ChartComponent from '../components/stock/ChartComponent';
import { useAuth } from '../context/AuthContext';

const StockDetailsPage = () => {
    const { symbol } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    const [stock, setStock] = useState(null);
    const [candles, setCandles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isWatchlisted, setIsWatchlisted] = useState(false);

    useEffect(() => {
        fetchData();
        checkWatchlist();
    }, [symbol]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [quoteRes, candleRes] = await Promise.all([
                api.get(`/stocks/quote/${symbol}`),
                api.get(`/stocks/candles/${symbol}?days=30`),
            ]);
            setStock(quoteRes.data);
            setCandles(candleRes.data);
        } catch (error) {
            console.error('Fetch Error:', error);
            setMessage({ type: 'error', text: 'Stock not found or API authentication failed.' });
        } finally {
            setLoading(false);
        }
    };

    const checkWatchlist = async () => {
        try {
            const { data } = await api.get('/auth/profile');
            setIsWatchlisted(data.watchlist.some(s => s.symbol === symbol.toUpperCase()));
        } catch (err) { }
    };

    const handleTrade = async (type) => {
        setActionLoading(true);
        try {
            await api.post('/transactions', {
                symbol: symbol.toUpperCase(),
                type,
                quantity,
                price: stock.price
            });
            setMessage({ type: 'success', text: `${type.toUpperCase()} request submitted for approval!` });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Trade failed' });
        } finally {
            setActionLoading(false);
        }
    };

    const toggleWatchlist = async () => {
        try {
            if (isWatchlisted) {
                await api.delete(`/watchlist/${symbol}`);
                setIsWatchlisted(false);
            } else {
                await api.post('/watchlist', { symbol: symbol.toUpperCase(), name: symbol });
                setIsWatchlisted(true);
            }
            const { data } = await api.get('/auth/profile');
            setUser(data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            <p className="text-slate-500 animate-pulse">Analyzing market data...</p>
        </div>
    );

    if (!stock && !loading) return (
        <div className="text-center py-20">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Stock Not Found</h1>
            <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 font-bold">Go Back</button>
        </div>
    );

    const isPositive = stock.changePercent >= 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-primary-600 transition-colors font-medium mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass p-8 rounded-3xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <h1 className="text-4xl font-black">{symbol.toUpperCase()}</h1>
                                    <button
                                        onClick={toggleWatchlist}
                                        className={`p-2 rounded-full transition-all ${isWatchlisted ? 'bg-yellow-50 text-yellow-500 shadow-inner' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-yellow-500'}`}
                                    >
                                        <Star className={`h-6 w-6 ${isWatchlisted ? 'fill-yellow-500' : ''}`} />
                                    </button>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Global Markets • Real-time Data</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-black">${(stock.price || 0).toFixed(2)}</p>
                                <div className={`flex items-center justify-end text-lg font-bold mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {isPositive ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                                    {isPositive ? '+' : ''}{(stock.change || 0).toFixed(2)} ({(stock.changePercent || 0).toFixed(2)}%)
                                </div>
                            </div>
                        </div>

                        <ChartComponent data={candles} />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                            {[
                                { label: 'Open', val: stock.open },
                                { label: 'High', val: stock.high },
                                { label: 'Low', val: stock.low },
                                { label: 'Prev Close', val: stock.prevClose }
                            ].map(item => (
                                <div key={item.label} className="space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-lg font-bold">${(item.val || 0).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-8 rounded-3xl sticky top-24 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center">
                            <ShoppingCart className="h-5 w-5 mr-2 text-primary-600" />
                            Trade {symbol.toUpperCase()}
                        </h2>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {message.type === 'success' ? <ShieldCheck className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="flex justify-between text-sm font-bold text-slate-500 uppercase">
                                <span>Market Price</span>
                                <span>${(stock.price || 0).toFixed(2)}</span>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold">Order Quantity</label>
                                <div className="flex items-center space-x-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><Minus className="h-4 w-4" /></button>
                                    <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 bg-transparent text-center font-black text-xl outline-none" />
                                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><Plus className="h-4 w-4" /></button>
                                </div>
                            </div>

                            <div className="pt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-500">Estimated Total</span>
                                    <span className="text-xl font-black text-primary-600">${((stock.price || 0) * quantity).toFixed(2)}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleTrade('buy')} disabled={actionLoading} className="py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50">BUY</button>
                                    <button onClick={() => handleTrade('sell')} disabled={actionLoading} className="py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50">SELL</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockDetailsPage;
