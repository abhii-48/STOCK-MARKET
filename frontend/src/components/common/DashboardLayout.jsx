import React from 'react';
import Navbar from './Navbar';
import MarketHeader from './MarketHeader';
import WatchlistSidebar from '../stock/WatchlistSidebar';
import MarketAssistant from './MarketAssistant';

const DashboardLayout = ({ children, showSidebar = true }) => {
    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
            {/* Top Navigation */}
            <Navbar />
            
            {/* Market Indices Header */}
            <MarketHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Watchlist Sidebar */}
                {showSidebar && (
                    <aside className="hidden lg:block">
                        <WatchlistSidebar />
                    </aside>
                )}

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="p-0 sm:p-2 lg:p-4">
                        {children}
                    </div>
                </main>
            </div>

            {/* AI Assistant Floating Widget */}
            <MarketAssistant />
        </div>
    );
};

export default DashboardLayout;
