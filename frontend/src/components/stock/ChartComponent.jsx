import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { 
    Maximize2, 
    Settings, 
    Camera, 
    ChevronDown, 
    LayoutGrid, 
    MousePointer2, 
    Pencil, 
    Type,
    Smile
} from 'lucide-react';

const ChartComponent = ({ data }) => {
    const { darkMode } = useTheme();
    const timeframes = ['5m', '15m', '1h', '1D', '1W', '1M'];
    const [activeTimeframe, setActiveTimeframe] = React.useState('1D');

    if (!data || data.length === 0) return (
        <div className="h-[450px] flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No data available for chart</p>
        </div>
    );

    return (
        <div className="space-y-4 mt-8">
            {/* Chart Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 overflow-x-auto no-scrollbar gap-4">
                <div className="flex items-center space-x-1 min-w-fit">
                    {timeframes.map(tf => (
                        <button
                            key={tf}
                            onClick={() => setActiveTimeframe(tf)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${tf === activeTimeframe ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        >
                            {tf}
                        </button>
                    ))}
                    <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800 mx-2"></div>
                    <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <LayoutGrid className="h-3.5 w-3.5" />
                        <span>Indicators</span>
                    </button>
                </div>

                <div className="flex items-center space-x-4 min-w-fit">
                    <div className="flex items-center space-x-2 text-slate-300">
                        <MousePointer2 className="h-4 w-4 hover:text-slate-500 cursor-pointer" />
                        <Pencil className="h-4 w-4 hover:text-slate-500 cursor-pointer" />
                        <Type className="h-4 w-4 hover:text-slate-500 cursor-pointer" />
                        <Smile className="h-4 w-4 hover:text-slate-500 cursor-pointer" />
                    </div>
                    <div className="h-4 w-[1px] bg-slate-100 dark:bg-slate-800"></div>
                    <div className="flex items-center space-x-3 text-slate-400">
                        <Settings className="h-4 w-4 hover:text-primary-600 cursor-pointer" />
                        <Camera className="h-4 w-4 hover:text-primary-600 cursor-pointer" />
                        <Maximize2 className="h-4 w-4 hover:text-primary-600 cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="h-[450px] w-full relative group">
                {/* Floating Price Display */}
                <div className="absolute top-4 left-4 z-10 flex flex-col pointer-events-none">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Feed</span>
                    <span className="text-lg font-black text-primary-600 animate-pulse">
                        ${(data[data.length - 1]?.price || 0).toFixed(2)}
                    </span>
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                            dy={10}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                            orientation="right"
                        />
                        <Tooltip
                            cursor={{ stroke: '#0ea5e9', strokeWidth: 2, strokeDasharray: '5 5' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="glass p-3 rounded-xl shadow-2xl border-primary-500/10">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{payload[0].payload.date}</p>
                                            <p className="text-lg font-black text-primary-600">${payload[0].value.toFixed(2)}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartComponent;
