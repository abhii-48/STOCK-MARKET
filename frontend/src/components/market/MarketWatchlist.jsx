import React from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import StockCard from '../stock/StockCard';

const MarketWatchlist = ({ watchlist = [] }) => {
    return (
        <div className="glass p-6 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold tracking-tight flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500/20" />
                    Your Watchlist
                </h2>
                <Link to="/portfolio" className="text-xs font-bold text-primary-600 flex items-center hover:underline">
                    VIEW ALL <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
            </div>
            
            {watchlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {watchlist.slice(0, 5).map((stock) => (
                        <StockCard key={stock.symbol} symbol={stock.symbol} name={stock.name} />
                    ))}
                </div>
            ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl relative z-10 hover:border-primary-500/30 transition-all duration-500 group/empty bg-white/50 dark:bg-slate-900/50">
                    <div className="p-3 rounded-full bg-slate-50 dark:bg-slate-800 group-hover/empty:scale-110 transition-transform duration-500">
                        <Star className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No active watches</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketWatchlist;
