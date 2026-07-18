import React, { useEffect, useState } from 'react';
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const SYMBOLS = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'ITC.NS', 'LT.NS', 'AXISBANK.NS'];
const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StockCard = ({ symbol, quote }) => {
  if (!quote) return null;
  const positive = Number(quote.changePercent) >= 0;
  return <Link to={`/stock/${symbol}`} aria-label={`Open ${quote.name || symbol} details`} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black text-slate-800 group-hover:text-primary-600 dark:text-slate-100">{symbol.replace('.NS', '')}</p><p className="mt-1 truncate text-xs text-slate-500">{quote.name || symbol}</p></div><div className={`rounded-xl p-2 ${positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>{positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}</div></div>
    <div className="mt-5 flex items-end justify-between gap-2"><span className="text-lg font-black tracking-tight">{formatPrice(quote.price)}</span><span className={`rounded-lg px-2 py-1 text-xs font-bold ${positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>{positive ? '+' : ''}{Number(quote.changePercent || 0).toFixed(2)}%</span></div>
  </Link>;
};

const MostBoughtStocks = () => {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.allSettled(SYMBOLS.map(async symbol => [symbol, (await api.get(`/stocks/quote/${symbol}`)).data])).then(results => {
      if (active) { setQuotes(Object.fromEntries(results.filter(result => result.status === 'fulfilled').map(result => result.value))); setLoading(false); }
    });
    return () => { active = false; };
  }, []);
  const visible = showAll ? SYMBOLS : SYMBOLS.slice(0, 5);
  return <section className="glass rounded-3xl p-6" aria-labelledby="most-bought-heading">
    <div className="mb-5 flex items-center justify-between gap-4"><div><h2 id="most-bought-heading" className="text-xl font-bold tracking-tight">Most Bought Stocks</h2><p className="mt-1 text-xs text-slate-500">Select a popular stock to view details, trade it, or add it to your watchlist.</p></div><button type="button" onClick={() => setShowAll(value => !value)} aria-expanded={showAll} className="flex shrink-0 items-center rounded-lg px-2 py-1 text-xs font-bold text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:hover:bg-slate-800">{showAll ? 'SHOW LESS' : 'VIEW ALL'}<ChevronRight className={`ml-1 h-4 w-4 transition-transform ${showAll ? 'rotate-90' : ''}`} /></button></div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">{loading ? visible.map(symbol => <div key={symbol} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />) : visible.map(symbol => <StockCard key={symbol} symbol={symbol} quote={quotes[symbol]} />)}</div>
    {!loading && Object.keys(quotes).length === 0 && <p className="py-6 text-center text-sm text-slate-500">Market quotes are currently unavailable.</p>}
  </section>;
};

export default MostBoughtStocks;