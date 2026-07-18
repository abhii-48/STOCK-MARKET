import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, ChevronsUpDown, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STOCKS = [
  ['RELIANCE.NS', 'Energy'], ['ONGC.NS', 'Energy'], ['BPCL.NS', 'Energy'],
  ['HDFCBANK.NS', 'Banking'], ['ICICIBANK.NS', 'Banking'], ['SBIN.NS', 'Banking'], ['AXISBANK.NS', 'Banking'],
  ['TCS.NS', 'IT'], ['INFY.NS', 'IT'], ['WIPRO.NS', 'IT'], ['HCLTECH.NS', 'IT'],
  ['MARUTI.NS', 'Auto'], ['TATAMOTORS.NS', 'Auto'], ['M&M.NS', 'Auto'],
  ['ITC.NS', 'FMCG'], ['HINDUNILVR.NS', 'FMCG'], ['NESTLEIND.NS', 'FMCG'],
].map(([symbol, sector]) => ({ symbol, sector }));

const formatPrice = (price) => `₹${Number(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SortButton = ({ label, field, sort, setSort, align = '' }) => (
  <button
    type="button"
    onClick={() => setSort(current => current.field === field ? { field, direction: -current.direction } : { field, direction: field === 'name' ? 1 : -1 })}
    className={`inline-flex items-center gap-1 text-left hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 ${align}`}
    aria-label={`Sort by ${label}`}
  >
    {label}<ChevronsUpDown className={`h-3.5 w-3.5 ${sort.field === field ? 'text-primary-600' : ''}`} />
  </button>
);

const MoversTable = ({ rows, loading, title, sort, setSort, expanded, toggleExpanded }) => (
  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
      <h3 className="text-sm font-black">{title}</h3><span className="text-xs text-slate-500">{rows.length} stocks</span>
    </div>
    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(90px,1fr)_minmax(82px,.7fr)] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 dark:bg-slate-800/50">
      <SortButton label="Stock" field="name" sort={sort} setSort={setSort} />
      <SortButton label="LTP" field="price" sort={sort} setSort={setSort} align="justify-end" />
      <SortButton label="% Chg" field="changePercent" sort={sort} setSort={setSort} align="justify-end" />
    </div>
    {loading ? Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse border-t border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50" />) : rows.slice(0, expanded ? rows.length : 5).map(row => {
      const positive = Number(row.changePercent) >= 0;
      return <Link key={row.symbol} to={`/stock/${row.symbol}`} aria-label={`Open ${row.name || row.symbol} details`} className="grid grid-cols-[minmax(0,1.5fr)_minmax(90px,1fr)_minmax(82px,.7fr)] items-center gap-3 border-t border-slate-100 px-4 py-3 transition hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:border-slate-800 dark:hover:bg-slate-800">
        <span className="min-w-0"><strong className="block truncate text-sm text-slate-800 dark:text-slate-100">{row.symbol.replace('.NS', '')}</strong><span className="block truncate text-xs text-slate-500">{row.name || row.sector}</span></span>
        <span className={`text-right text-sm font-bold ${positive ? 'text-green-600' : 'text-red-500'}`}>{formatPrice(row.price)}</span>
        <span className={`ml-auto inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-bold ${positive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>{positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}{positive ? '+' : ''}{Number(row.changePercent || 0).toFixed(2)}%</span>
      </Link>;
    })}
    {!loading && rows.length === 0 && <p className="p-6 text-center text-sm text-slate-500">No matching stocks are available right now.</p>}
    {rows.length > 5 && <button type="button" onClick={toggleExpanded} aria-expanded={expanded} className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-3 text-xs font-bold text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:border-slate-800 dark:hover:bg-slate-800">{expanded ? 'SHOW LESS' : 'VIEW ALL'}<ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} /></button>}
  </div>
);

const TopMovers = () => {
  const [direction, setDirection] = useState('Gainers');
  const [sector, setSector] = useState('All');
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ field: 'changePercent', direction: -1 });
  const [showAllMovers, setShowAllMovers] = useState(false);
  const [showAllSectors, setShowAllSectors] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled(STOCKS.map(async stock => ({ ...stock, ...(await api.get(`/stocks/quote/${stock.symbol}`)).data }))).then(results => {
      if (active) { setQuotes(results.filter(result => result.status === 'fulfilled').map(result => result.value)); setLoading(false); }
    });
    return () => { active = false; };
  }, []);

  const sortRows = (rows) => [...rows].sort((a, b) => {
    const aValue = sort.field === 'name' ? (a.name || a.symbol) : Number(a[sort.field] || 0);
    const bValue = sort.field === 'name' ? (b.name || b.symbol) : Number(b[sort.field] || 0);
    return aValue > bValue ? sort.direction : aValue < bValue ? -sort.direction : 0;
  });
  const movers = useMemo(() => sortRows(quotes.filter(quote => direction === 'Gainers' ? Number(quote.changePercent) >= 0 : Number(quote.changePercent) < 0)), [quotes, direction, sort]);
  const sectorRows = useMemo(() => sortRows(quotes.filter(quote => sector === 'All' || quote.sector === sector)), [quotes, sector, sort]);
  const sectors = ['All', 'Banking', 'IT', 'Energy', 'Auto', 'FMCG'];

  return <section className="glass rounded-3xl p-6" aria-labelledby="top-movers-heading">
    <div className="mb-6"><h2 id="top-movers-heading" className="text-xl font-bold tracking-tight">Top Movers and Sectorwise Movements</h2><p className="mt-1 text-xs text-slate-500">Filter live market quotes, sort results, or select a stock to open its trading page.</p></div>
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="inline-flex w-fit rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Choose market movers">
        {['Gainers', 'Losers'].map(option => <button key={option} type="button" onClick={() => { setDirection(option); setShowAllMovers(false); }} aria-pressed={direction === option} className={`rounded-lg px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${direction === option ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-100'}`}>{option}</button>)}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by sector">
        {sectors.map(option => <button key={option} type="button" onClick={() => { setSector(option); setShowAllSectors(false); }} aria-pressed={sector === option} className={`rounded-lg border px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-primary-500 ${sector === option ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300' : 'border-slate-200 text-slate-500 hover:border-primary-300 dark:border-slate-700'}`}>{option}</button>)}
      </div>
    </div>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <MoversTable rows={movers} loading={loading} title={`Top ${direction}`} sort={sort} setSort={setSort} expanded={showAllMovers} toggleExpanded={() => setShowAllMovers(value => !value)} />
      <MoversTable rows={sectorRows} loading={loading} title={`${sector === 'All' ? 'All sectors' : sector} movement`} sort={sort} setSort={setSort} expanded={showAllSectors} toggleExpanded={() => setShowAllSectors(value => !value)} />
    </div>
  </section>;
};

export default TopMovers;