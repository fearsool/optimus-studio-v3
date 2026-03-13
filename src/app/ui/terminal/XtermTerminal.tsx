'use client';

/**
 * 🖥️ XTERM TERMINAL - Real Terminal Experience
 * =============================================
 * Full PTY terminal with addons for fit and web links.
 * Fixed: Container dimension check before initialization.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';

interface XtermTerminalProps {
    onData?: (data: string) => void;
    onCommand?: (command: string) => void;
    fontSize?: number;
    theme?: 'dark' | 'light';
}

const DARK_THEME = {
    background: '#0c0c0c',
    foreground: '#d4d4d4',
    cursor: '#aeafad',
    cursorAccent: '#0c0c0c',
    selectionBackground: '#264f78',
    black: '#000000',
    red: '#cd3131',
    green: '#0dbc79',
    yellow: '#e5e510',
    blue: '#2472c8',
    magenta: '#bc3fbc',
    cyan: '#11a8cd',
    white: '#e5e5e5',
    brightBlack: '#666666',
    brightRed: '#f14c4c',
    brightGreen: '#23d18b',
    brightYellow: '#f5f543',
    brightBlue: '#3b8eea',
    brightMagenta: '#d670d6',
    brightCyan: '#29b8db',
    brightWhite: '#ffffff',
};

export const XtermTerminal: React.FC<XtermTerminalProps> = ({
    onData,
    onCommand,
    fontSize = 14,
    theme = 'dark'
}) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<any>(null);
    const fitAddonRef = useRef<any>(null);
    const commandBufferRef = useRef<string>('');
    const [isReady, setIsReady] = useState(false);

    const writePrompt = useCallback(() => {
        if (xtermRef.current) {
            xtermRef.current.write('\r\n\x1b[36moptimus\x1b[0m:\x1b[33m~\x1b[0m$ ');
        }
    }, []);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Wait for container to have dimensions
        const container = terminalRef.current;
        const rect = container.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            // Container not ready, wait and retry
            const timer = setTimeout(() => setIsReady(prev => !prev), 100);
            return () => clearTimeout(timer);
        }

        // Dynamic import to avoid SSR issues
        const initTerminal = async () => {
            try {
                const { Terminal } = await import('xterm');
                const { FitAddon } = await import('xterm-addon-fit');
                // CSS is imported via next.config if needed, or use global import

                // Create terminal
                const terminal = new Terminal({
                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                    fontSize,
                    theme: theme === 'dark' ? DARK_THEME : undefined,
                    cursorBlink: true,
                    cursorStyle: 'bar',
                    allowTransparency: true,
                    scrollback: 10000,
                    tabStopWidth: 4,
                });

                // Fit addon
                const fitAddon = new FitAddon();
                terminal.loadAddon(fitAddon);

                // Open terminal
                terminal.open(container);

                // Delay fit to ensure DOM is ready
                setTimeout(() => {
                    try {
                        fitAddon.fit();
                    } catch (e) {
                        console.warn('[XtermTerminal] Fit error, retrying...');
                    }
                }, 50);

                // Store refs
                xtermRef.current = terminal;
                fitAddonRef.current = fitAddon;

                // Welcome message
                terminal.writeln('\x1b[1;35m╔════════════════════════════════════════╗\x1b[0m');
                terminal.writeln('\x1b[1;35m║\x1b[0m  \x1b[1;36mOPTIMUS STUDIO TERMINAL\x1b[0m              \x1b[1;35m║\x1b[0m');
                terminal.writeln('\x1b[1;35m║\x1b[0m  Local-First • Offline Ready           \x1b[1;35m║\x1b[0m');
                terminal.writeln('\x1b[1;35m╚════════════════════════════════════════╝\x1b[0m');
                terminal.write('\r\n\x1b[36moptimus\x1b[0m:\x1b[33m~\x1b[0m$ ');

                // Handle input
                terminal.onData((data: string) => {
                    if (onData) onData(data);

                    switch (data) {
                        case '\r': // Enter
                            if (onCommand && commandBufferRef.current.trim()) {
                                onCommand(commandBufferRef.current.trim());
                            }
                            terminal.write('\r\n');
                            commandBufferRef.current = '';
                            terminal.write('\x1b[36moptimus\x1b[0m:\x1b[33m~\x1b[0m$ ');
                            break;
                        case '\u007F': // Backspace
                            if (commandBufferRef.current.length > 0) {
                                commandBufferRef.current = commandBufferRef.current.slice(0, -1);
                                terminal.write('\b \b');
                            }
                            break;
                        case '\u0003': // Ctrl+C
                            terminal.write('^C');
                            commandBufferRef.current = '';
                            terminal.write('\r\n\x1b[36moptimus\x1b[0m:\x1b[33m~\x1b[0m$ ');
                            break;
                        default:
                            if (data >= ' ') {
                                commandBufferRef.current += data;
                                terminal.write(data);
                            }
                    }
                });

                // Resize observer with debounce
                let resizeTimeout: NodeJS.Timeout;
                const resizeObserver = new ResizeObserver(() => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        try {
                            const rect = container.getBoundingClientRect();
                            if (rect.width > 0 && rect.height > 0) {
                                fitAddon.fit();
                            }
                        } catch (e) {
                            // Ignore fit errors during resize
                        }
                    }, 100);
                });
                resizeObserver.observe(container);

                return () => {
                    clearTimeout(resizeTimeout);
                    resizeObserver.disconnect();
                    terminal.dispose();
                };
            } catch (error) {
                console.error('[XtermTerminal] Init error:', error);
            }
        };

        initTerminal();
    }, [fontSize, theme, onData, onCommand, isReady]);

    return (
        <div
            ref={terminalRef}
            className="w-full h-full bg-[#0c0c0c] rounded-lg overflow-hidden"
            style={{ padding: '8px', minHeight: '200px', minWidth: '300px' }}
        />
    );
};

export default XtermTerminal;
