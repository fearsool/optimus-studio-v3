'use client';

import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';

export type ArcState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface ArcReactorWidgetProps {
    state: ArcState;
    onToggleListen: () => void;
    onMute?: () => void;
    subtitle?: string;
    size?: number;
}

export const ArcReactorWidget: React.FC<ArcReactorWidgetProps> = ({
    state = 'idle',
    onToggleListen,
    onMute,
    subtitle = 'Süper Ultra Optimus v7 Çekirdeği',
    size = 280
}) => {
    const [audioBars, setAudioBars] = useState<number[]>(new Array(16).fill(10));

    // Dynamic wave simulation based on state
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (state === 'listening' || state === 'speaking') {
            timer = setInterval(() => {
                setAudioBars(Array.from({ length: 16 }, () => Math.floor(Math.random() * (state === 'speaking' ? 38 : 26)) + 8));
            }, 90);
        } else if (state === 'thinking') {
            timer = setInterval(() => {
                setAudioBars(Array.from({ length: 16 }, (_, i) => Math.floor(Math.sin(Date.now() / 200 + i) * 12) + 14));
            }, 100);
        } else {
            setAudioBars(new Array(16).fill(6));
        }
        return () => clearInterval(timer);
    }, [state]);

    // Color palette based on status
    const getColors = () => {
        switch (state) {
            case 'listening':
                return {
                    primary: '#00f0ff',
                    secondary: '#0284c7',
                    glow: 'rgba(0, 240, 255, 0.45)',
                    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
                    label: 'DİNLİYOR (SES BEKLENİYOR)'
                };
            case 'thinking':
                return {
                    primary: '#f59e0b',
                    secondary: '#d97706',
                    glow: 'rgba(245, 158, 11, 0.45)',
                    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                    label: 'İŞLENİYOR / DÜŞÜNÜYOR'
                };
            case 'speaking':
                return {
                    primary: '#a855f7',
                    secondary: '#7c3aed',
                    glow: 'rgba(168, 85, 247, 0.45)',
                    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                    label: 'KONUŞUYOR (SESLİ YANIT)'
                };
            case 'idle':
            default:
                return {
                    primary: '#06b6d4',
                    secondary: '#0891b2',
                    glow: 'rgba(6, 182, 212, 0.3)',
                    badge: 'bg-cyan-950/40 text-cyan-400 border-cyan-700/30',
                    label: 'HAZIR // OPTIMUS V7'
                };
        }
    };

    const colors = getColors();

    return (
        <div className="flex flex-col items-center justify-center select-none relative group">
            {/* Holographic Arc-Reactor Container */}
            <div
                className="relative cursor-pointer transition-transform duration-300 active:scale-95 flex items-center justify-center"
                style={{ width: size, height: size }}
                onClick={onToggleListen}
                title="Konuşmak için tıkla / Dinlemeyi durdur"
            >
                {/* Ambient Glow Background */}
                <div
                    className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 opacity-60 pointer-events-none"
                    style={{ background: colors.glow }}
                />

                <svg
                    width={size}
                    height={size}
                    viewBox="0 0 300 300"
                    className="overflow-visible"
                >
                    <defs>
                        {/* Glow Filter */}
                        <filter id="arc-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <radialGradient id="core-radial" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                            <stop offset="40%" stopColor={colors.primary} stopOpacity="0.8" />
                            <stop offset="85%" stopColor={colors.secondary} stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Outer Static Calibration Ring with Ticks */}
                    <circle
                        cx="150"
                        cy="150"
                        r="140"
                        fill="none"
                        stroke={colors.primary}
                        strokeWidth="1.5"
                        strokeDasharray="4 8"
                        opacity="0.3"
                    />

                    {/* Outer Rotating Cyber Ring */}
                    <g
                        style={{
                            transformOrigin: '150px 150px',
                            animation: `spin ${state === 'thinking' ? '3s' : '18s'} linear infinite`
                        }}
                    >
                        <circle
                            cx="150"
                            cy="150"
                            r="132"
                            fill="none"
                            stroke={colors.primary}
                            strokeWidth="2.5"
                            strokeDasharray="45 15 20 15 80 20"
                            filter="url(#arc-glow)"
                            opacity="0.85"
                        />
                        {/* 4 Outer Accent Nodes */}
                        {[0, 90, 180, 270].map((deg) => {
                            const rad = (deg * Math.PI) / 180;
                            const x = 150 + 132 * Math.cos(rad);
                            const y = 150 + 132 * Math.sin(rad);
                            return (
                                <circle
                                    key={deg}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#ffffff"
                                    stroke={colors.primary}
                                    strokeWidth="1.5"
                                    filter="url(#arc-glow)"
                                />
                            );
                        })}
                    </g>

                    {/* Middle Counter-Rotating Segment Ring */}
                    <g
                        style={{
                            transformOrigin: '150px 150px',
                            animation: `spin-reverse ${state === 'thinking' ? '2.5s' : '14s'} linear infinite`
                        }}
                    >
                        <circle
                            cx="150"
                            cy="150"
                            r="110"
                            fill="none"
                            stroke={colors.primary}
                            strokeWidth="3"
                            strokeDasharray="12 10"
                            opacity="0.5"
                        />
                        {/* Triangular Core Markers */}
                        {[30, 90, 150, 210, 270, 330].map((deg) => {
                            const rad = (deg * Math.PI) / 180;
                            const x = 150 + 110 * Math.cos(rad);
                            const y = 150 + 110 * Math.sin(rad);
                            return (
                                <line
                                    key={deg}
                                    x1={150 + 104 * Math.cos(rad)}
                                    y1={150 + 104 * Math.sin(rad)}
                                    x2={x}
                                    y2={y}
                                    stroke={colors.primary}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            );
                        })}
                    </g>

                    {/* Inner Arc Core Coils (10 Ten-Segment Reactor Coils) */}
                    <g
                        style={{
                            transformOrigin: '150px 150px',
                            animation: `spin ${state === 'speaking' ? '6s' : '30s'} linear infinite`
                        }}
                    >
                        {Array.from({ length: 10 }).map((_, i) => {
                            const deg = i * 36;
                            const rad = (deg * Math.PI) / 180;
                            const x1 = 150 + 72 * Math.cos(rad);
                            const y1 = 150 + 72 * Math.sin(rad);
                            const x2 = 150 + 92 * Math.cos(rad);
                            const y2 = 150 + 92 * Math.sin(rad);
                            return (
                                <g key={i}>
                                    <line
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke={colors.primary}
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        opacity="0.8"
                                        filter="url(#arc-glow)"
                                    />
                                    <line
                                        x1={x1}
                                        y1={y1}
                                        x2={x2}
                                        y2={y2}
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                    />
                                </g>
                            );
                        })}
                    </g>

                    {/* Central Fusion Core (Pulsing Energy Sphere) */}
                    <circle
                        cx="150"
                        cy="150"
                        r={state === 'listening' || state === 'speaking' ? '54' : '48'}
                        fill="url(#core-radial)"
                        filter="url(#arc-glow)"
                        className="transition-all duration-300"
                    />

                    {/* Central Ring Boundary */}
                    <circle
                        cx="150"
                        cy="150"
                        r="52"
                        fill="none"
                        stroke={colors.primary}
                        strokeWidth="2"
                        opacity="0.8"
                    />

                    {/* Center Icon Indicator */}
                    <g transform="translate(136, 136)">
                        {state === 'listening' ? (
                            <path
                                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ) : state === 'speaking' ? (
                            <path
                                d="M11 5L6 9H2v6h4l5 4V5z M19.07 4.93a10 10 0 0 1 0 14.14 M15.54 8.46a5 5 0 0 1 0 7.07"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ) : state === 'thinking' ? (
                            <path
                                d="M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                            />
                        ) : (
                            <path
                                d="M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5"
                                fill="none"
                                stroke="#ffffff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        )}
                    </g>
                </svg>

                {/* Center Hover Action Helper */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full backdrop-blur-xs">
                    <span className="text-[11px] font-mono tracking-widest text-white uppercase px-2 py-1 bg-cyan-900/80 rounded border border-cyan-500/50">
                        {state === 'listening' ? 'Durdur' : 'Konuş'}
                    </span>
                </div>
            </div>

            {/* Live Audio Frequency Spectrum Waveform */}
            <div className="flex items-center gap-1 mt-4 h-9 px-4 py-1 rounded-full bg-black/40 border border-cyan-500/20 backdrop-blur-md">
                {audioBars.map((height, idx) => (
                    <div
                        key={idx}
                        className="w-1 rounded-full transition-all duration-75"
                        style={{
                            height: `${height}px`,
                            backgroundColor: colors.primary,
                            opacity: 0.3 + (height / 45) * 0.7,
                            boxShadow: `0 0 6px ${colors.primary}`
                        }}
                    />
                ))}
            </div>

            {/* Tactical Status Badge & Subtitle */}
            <div className="mt-3 flex flex-col items-center text-center">
                <div className={`px-3 py-0.5 rounded-full text-[11px] font-mono tracking-widest border uppercase flex items-center gap-1.5 shadow-sm ${colors.badge}`}>
                    <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: colors.primary }} />
                    {colors.label}
                </div>
                <p className="text-[12px] text-gray-400 mt-1 font-mono">{subtitle}</p>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
            `}</style>
        </div>
    );
};
