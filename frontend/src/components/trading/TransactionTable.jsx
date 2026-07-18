import React from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';

const TransactionTable = ({ transactions, isAdmin = false, onAction = null }) => {
    return (
        <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-separate border-spacing-y-3">
                <thead>
                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {isAdmin && <th className="px-8 py-2">Entity</th>}
                        <th className="px-8 py-2">Asset</th>
                        <th className="px-8 py-2">Execution</th>
                        <th className="px-8 py-2">Volume</th>
                        <th className="px-8 py-2">Entry Price</th>
                        <th className="px-8 py-2">Total Value</th>
                        <th className="px-8 py-2 text-right">Settlement</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(t => (
                        <tr key={t._id} className="group glass hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                            {isAdmin && (
                                <td className="px-8 py-5 rounded-l-[1.5rem]">
                                    <div className="flex flex-col">
                                        <span className="font-black text-sm">{t.user?.username}</span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.user?.email}</span>
                                    </div>
                                </td>
                            )}
                            <td className={`px-8 py-5 font-black text-sm ${!isAdmin ? 'rounded-l-[1.5rem]' : ''}`}>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-6 bg-primary-600 rounded-full"></div>
                                    <span>{t.symbol}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5 uppercase text-[10px] font-black tracking-widest">
                                <span className={`px-2 py-1 rounded-md ${t.type === 'buy' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.type}</span>
                            </td>
                            <td className="px-8 py-5 text-sm font-black text-slate-600 dark:text-slate-300">{t.quantity || 0}</td>
                            <td className="px-8 py-5 text-sm font-black text-slate-600 dark:text-slate-300">${(t.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-8 py-5 font-black text-sm text-primary-600">${(t.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-8 py-5 text-right rounded-r-[1.5rem]">
                                {isAdmin && t.status === 'pending' ? (
                                    <div className="flex items-center justify-end space-x-3">
                                        <button 
                                            onClick={() => onAction(t._id, 'approved')} 
                                            className="p-3 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-90"
                                            title="Approve Settlement"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                        </button>
                                        <button 
                                            onClick={() => onAction(t._id, 'rejected')} 
                                            className="p-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
                                            title="Reject Settlement"
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                        t.status === 'approved' ? 'bg-green-500/10 text-green-600 border border-green-500/20' :
                                        t.status === 'rejected' ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                                        'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                                        }`}>
                                        {t.status === 'approved' && <CheckCircle className="h-3 w-3 mr-2" />}
                                        {t.status === 'rejected' && <XCircle className="h-3 w-3 mr-2" />}
                                        {t.status === 'pending' && <Clock className="h-3 w-3 mr-2 animate-pulse" />}
                                        {t.status}
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 7 : 6} className="py-20 text-center">
                                <div className="space-y-4 flex flex-col items-center">
                                    <div className="p-4 rounded-full bg-slate-50 dark:bg-slate-900">
                                        <Clock className="h-8 w-8 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No activity logged</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Your trade history will appear here once executed</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionTable;

