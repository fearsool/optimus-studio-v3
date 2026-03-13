'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Here you would log to the Logger service
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 h-full bg-[#161b22] text-gray-300 font-mono text-center">
                    <div className="bg-red-900/20 p-6 rounded-2xl border border-red-500/30 max-w-md">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-bold text-red-400 mb-2">System Anomaly Detected</h1>
                        <p className="text-sm text-gray-400 mb-6">
                            The neural interface encountered a critical error. The self-healing protocols have been triggered.
                        </p>
                        <div className="bg-black/50 p-3 rounded text-left mb-6 overflow-auto max-h-32 text-xs text-red-300 border border-red-900/50">
                            {this.state.error?.message}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full mx-auto transition-colors font-bold"
                        >
                            <RefreshCw size={16} /> Reboot System
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
