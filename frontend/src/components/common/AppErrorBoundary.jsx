import React from 'react';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, errorMessage: error?.message || 'Unknown startup error' };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Dashboard startup error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100">
                    <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl">
                        <h1 className="text-2xl font-bold">Unable to load the dashboard</h1>
                        <p className="mt-3 text-sm text-slate-400">Your saved browser data may be outdated. Reload the page to try again.</p>
                        {import.meta.env.DEV && (
                            <p className="mt-4 break-words rounded-lg bg-slate-950 p-3 font-mono text-xs text-red-300">
                                {this.state.errorMessage}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700"
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
