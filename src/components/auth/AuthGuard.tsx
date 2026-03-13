'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key } from 'lucide-react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const storedAuth = localStorage.getItem('optimus_auth');
        if (storedAuth === 'true') setIsAuthenticated(true);
    }, []);

    if (!mounted) return null; // Prevent hydration mismatch

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple security for MVP - Hardcoded PIN: 2026
        if (pin === '2026') {
            localStorage.setItem('optimus_auth', 'true');
            setIsAuthenticated(true);
        } else {
            setError(true);
            setPin('');
        }
    };

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col items-center justify-center p-8 h-screen w-screen bg-[#050505] text-gray-300 font-mono relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-sm bg-[#161b22] border border-gray-800 rounded-2xl p-8 shadow-2xl shadow-blue-900/20">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-widest">OPTIMUS PRIME</h1>
                    <p className="text-xs text-blue-400 font-bold mt-1">SECURITY GATE v4.0</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => { setPin(e.target.value); setError(false); }}
                            className={`w-full bg-[#0d1117] border ${error ? 'border-red-500' : 'border-gray-700'} rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors text-center text-lg tracking-[0.5em]`}
                            placeholder="PIN CODE"
                            maxLength={4}
                            autoFocus
                        />
                    </div>

                    {error && <div className="text-red-500 text-xs text-center animate-pulse">Access Denied. Invalid Protocol.</div>}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                    >
                        <Key className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                        AUTHENTICATE
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-gray-600">
                        UNAUTHORIZED ACCESS IS STRICTLY PROHIBITED.<br />
                        SYSTEM ACTIVITY IS LOGGED AND MONITORED.
                    </p>
                </div>
            </div>
        </div>
    );
};
