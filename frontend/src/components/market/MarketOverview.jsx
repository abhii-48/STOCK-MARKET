import React, { useState, useEffect } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import IndexOverview from './IndexOverview';
import MarketWatchlist from './MarketWatchlist';
import MostBoughtStocks from './MostBoughtStocks';
import TopMovers from './TopMovers';
import TopPerformers from './TopPerformers';

const IndexDetailsTab = ({ symbol, title }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIndex = async () => {
            try {
                // Find our specific index from the indices list
                const res = await api.get('/stocks/indices');
                const matched = res.data.find(idx => idx.symbol === symbol);
                if (matched) {
                    setData(matched);
                } else {
                    // Fallback query single quote if not in basic indices list
                    const quoteRes = await api.get(`/stocks/quote/${symbol}`);
                    setData(quoteRes.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchIndex();
    }, [symbol]);

    if (loading) return (
        <div className="glass p-8 rounded-3xl h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
    );

    if (!data) return (
        <div className="glass p-8 text-center text-slate-500 rounded-3xl">
            No data available for {title || symbol}
        </div>
    );

    const isPositive = data.changePercent >= 0;

    return (
        <div className="glass p-8 rounded-3xl space-y-6 relative overflow-hidden group">
            <div className={`absolute -right-20 -top-20 w-80 h-80 ${isPositive ? 'bg-green-500/5' : 'bg-red-500/5'} rounded-full blur-[100px]`}></div>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold tracking-tight mb-1">{title}</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.symbol}</span>
                </div>
                <span className="px-3 py-1 bg-primary-500/10 text-[10px] font-black rounded-full text-primary-600 uppercase tracking-widest">F&O Active</span>
            </div>

            <div className="flex items-baseline space-x-4">
                <span className="text-4xl font-black tracking-tighter">₹{data.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)} ({data.changePercent.toFixed(2)}%)
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Open Price</p>
                    <p className="text-sm font-black">₹{(data.open || data.price).toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Prev Close</p>
                    <p className="text-sm font-black">₹{(data.prevClose || data.price).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

const MarketOverview = ({ watchlist }) => {
    const [activeTab, setActiveTab] = useState('Stock Discovery');
    const [commodities, setCommodities] = useState([]);
    const [news, setNews] = useState([]);
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        if (activeTab === 'Commodities') {
            fetchCommodities();
        } else if (activeTab === 'News') {
            fetchNews();
        }
    }, [activeTab]);

    const fetchCommodities = async () => {
        setLoadingData(true);
        try {
            const { data } = await api.get('/stocks/commodities');
            setCommodities(data);
        } catch (error) {
            console.error('Error fetching commodities:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const fetchNews = async () => {
        setLoadingData(true);
        try {
            const { data } = await api.get('/stocks/news');
            setNews(data);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Stock Discovery':
                return (
                    <>
                        <IndexOverview />
                        <MarketWatchlist watchlist={watchlist} />
                        <MostBoughtStocks />
                        <TopMovers />
                        <TopPerformers />
                    </>
                );
            case 'Index F&O':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
                        <IndexDetailsTab symbol="^NSEI" title="NIFTY 50" />
                        <IndexDetailsTab symbol="^NSEBANK" title="NIFTY BANK" />
                    </div>
                );
            case 'Stocks F&O':
                return (
                    <div className="glass p-8 rounded-3xl space-y-6 animate-slide-up">
                        <h2 className="text-xl font-bold tracking-tight">Active Stocks in F&O Segment</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'SBIN.NS', 'ICICIBANK.NS', 'HDFCBANK.NS'].map(sym => (
                                <IndexDetailsTab key={sym} symbol={sym} title={sym.replace('.NS', '')} />
                            ))}
                        </div>
                    </div>
                );
            case 'Commodities':
                return (
                    <div className="glass p-8 rounded-3xl space-y-6 animate-slide-up">
                        <h2 className="text-xl font-bold tracking-tight">Commodity Futures</h2>
                        {loadingData ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {commodities.map(c => {
                                    const isPositive = c.changePercent >= 0;
                                    return (
                                        <div key={c.symbol} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.symbol}</p>
                                            <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">{c.name}</p>
                                            <div className="flex justify-between items-end mt-4">
                                                <span className="text-2xl font-black">${c.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                <span className={`text-xs font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isPositive ? '▲' : '▼'} {c.changePercent.toFixed(2)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            case 'All Indices':
                return (
                    <div className="glass p-8 rounded-3xl space-y-6 animate-slide-up">
                        <h2 className="text-xl font-bold tracking-tight">Global & Domestic Indices</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <IndexDetailsTab symbol="^NSEI" title="NIFTY 50" />
                            <IndexDetailsTab symbol="^BSESN" title="SENSEX" />
                            <IndexDetailsTab symbol="^NSEBANK" title="NIFTY BANK" />
                            <IndexDetailsTab symbol="^CNXIT" title="NIFTY IT" />
                            <IndexDetailsTab symbol="^DJI" title="Dow Jones (US)" />
                            <IndexDetailsTab symbol="^IXIC" title="Nasdaq (US)" />
                        </div>
                    </div>
                );
            case 'News':
                return (
                    <div className="glass p-8 rounded-3xl space-y-6 animate-slide-up">
                        <h2 className="text-xl font-bold tracking-tight">Market Live Feed & Financial News</h2>
                        {loadingData ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {news.map(art => (
                                    <a 
                                        href={art.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        key={art.uuid} 
                                        className="flex flex-col sm:flex-row gap-6 p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-500 transition-all duration-300 group"
                                    >
                                        {art.thumbnailUrl && (
                                            <img src={art.thumbnailUrl} alt={art.title} className="w-full sm:w-40 h-28 object-cover rounded-xl shrink-0" />
                                        )}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-base font-black text-slate-800 dark:text-slate-200 group-hover:text-primary-600 transition-colors leading-snug">{art.title}</h3>
                                                <p className="text-xs text-slate-400 font-medium mt-2">{art.publisher} • {new Date(art.publishedAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-xs font-bold text-primary-600 flex items-center mt-4">
                                                READ STORY <ExternalLink className="h-3 w-3 ml-1" />
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    const tabs = ['Stock Discovery', 'Index F&O', 'Stocks F&O', 'Commodities', 'All Indices', 'News'];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Navigation Tabs */}
            <div className="flex space-x-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
                {tabs.map(t => (
                    <button 
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`font-bold text-sm pb-3 border-b-2 whitespace-nowrap transition-all ${activeTab === t ? 'text-primary-600 border-primary-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-transparent'}`}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {renderTabContent()}
        </div>
    );
};

export default MarketOverview;
