import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChevronRight, Loader2 } from 'lucide-react';
import api from '../../services/api';

const IndexOverview = () => {
    const [indices, setIndices] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);

    useEffect(() => {
        fetchIndices();
    }, []);

    const fetchIndices = async () => {
        try {
            const { data } = await api.get('/stocks/indices');
            setIndices(data);
            if (data.length > 0) {
                setSelectedIndex(data[0]);
            }
        } catch (error) {
            console.error('Error fetching indices:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedIndex) {
            fetchChartData(selectedIndex.symbol);
        }
    }, [selectedIndex]);

    const fetchChartData = async (symbol) => {
        setChartLoading(true);
        try {
            const { data } = await api.get(`/stocks/candles/${symbol}`);
            // Transform data for chart if needed. Backend returns { date, price }
            setChartData(data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setChartData([]);
        } finally {
            setChartLoading(false);
        }
    };

    if (loading) return (
        <div className="glass p-6 rounded-3xl h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
    );

    return (
        <div className="glass p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Index Overview</h2>
            
            {/* Indices List */}
            <div className="flex overflow-x-auto no-scrollbar gap-8 pb-2 border-b border-slate-100 dark:border-slate-800">
                {indices.map((idx) => {
                    const isPositive = idx.change >= 0;
                    return (
                        <div 
                            key={idx.name} 
                            onClick={() => setSelectedIndex(idx)}
                            className={`min-w-max cursor-pointer pb-2 border-b-2 transition-all ${selectedIndex?.name === idx.name ? 'border-primary-500' : 'border-transparent hover:border-slate-300'}`}
                        >
                            <p className={`text-sm font-bold ${selectedIndex?.name === idx.name ? 'text-primary-600' : 'text-slate-600 dark:text-slate-300'}`}>{idx.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`text-sm font-black ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {idx.price.toLocaleString()}
                                </span>
                                <span className={`text-[10px] font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                    {isPositive ? '▲' : '▼'} {Math.abs(idx.change).toFixed(2)} ({idx.changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Selected Index Details & Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                <div className="col-span-1 space-y-8">
                    {selectedIndex && (
                        <>
                            <div>
                                <p className="text-xs text-slate-500 font-bold mb-2">Market Sentiment</p>
                                <div className="relative h-2 bg-gradient-to-r from-red-500 to-green-500 rounded-full w-full">
                                    <div className={`absolute -top-3 transition-all duration-1000`} style={{ left: `${50 + (selectedIndex.changePercent * 5)}%` }}>▼</div>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Bearish</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-black">Bullish</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Symbol</p>
                                    <p className="text-sm font-black">{selectedIndex.symbol}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
                                    <p className="text-sm font-black text-green-500">Live</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="col-span-2 h-64 border-l border-slate-100 dark:border-slate-800 pl-8 relative">
                    {chartLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 z-10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                        </div>
                    )}
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 8, fill: '#94a3b8'}} hide />
                            <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} dx={-10} orientation="right" />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                labelStyle={{ display: 'none' }}
                            />
                            <Area type="monotone" dataKey="price" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default IndexOverview;
