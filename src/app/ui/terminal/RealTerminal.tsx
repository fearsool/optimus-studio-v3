'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

type TerminalType = import('xterm').Terminal;
type FitAddonType = import('xterm-addon-fit').FitAddon;

export function RealTerminal() {
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<TerminalType | null>(null);
    const fitAddonRef = useRef<FitAddonType | null>(null);
    const inputBufferRef = useRef<string>('');
    const [isReady, setIsReady] = useState(false);

    const handleCommand = useCallback(async (cmd: string) => {
        const term = xtermRef.current;
        if (!term) return;

        const command = cmd.trim();
        if (!command) {
            term.write('$ ');
            return;
        }

        switch (command) {
            case 'clear':
                term.clear();
                term.write('$ ');
                break;
            case 'help':
                term.writeln('Commands: help, clear, status, version, ls, pwd');
                term.write('$ ');
                break;
            case 'version':
                term.writeln('Optimus Studio v1.0.0');
                term.write('$ ');
                break;
            case 'status':
                term.writeln('\x1b[32m●\x1b[0m Ollama: Ready');
                term.writeln('\x1b[32m●\x1b[0m SQLite: Ready');
                term.writeln('\x1b[33m○\x1b[0m GitHub: Not configured');
                term.write('$ ');
                break;
            default:
                term.writeln(`\x1b[90m> ${command}\x1b[0m`);
                try {
                    const res = await fetch('/api/terminal/execute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ command })
                    });
                    const data = await res.json();
                    if (data.output) term.writeln(data.output);
                    if (data.error) term.writeln(`\x1b[31m${data.error}\x1b[0m`);
                } catch {
                    term.writeln('\x1b[31mCommand failed\x1b[0m');
                }
                term.write('$ ');
        }
    }, []);

    useEffect(() => {
        if (!terminalRef.current) return;

        const container = terminalRef.current;
        const rect = container.getBoundingClientRect();

        if (rect.width <= 0 || rect.height <= 0) {
            const timer = setTimeout(() => setIsReady(prev => !prev), 100);
            return () => clearTimeout(timer);
        }

        let term: TerminalType | null = null;
        let disposed = false;

        const init = async () => {
            const { Terminal } = await import('xterm');
            const { FitAddon } = await import('xterm-addon-fit');

            if (disposed) return;

            term = new Terminal({
                theme: {
                    background: '#0d1117',
                    foreground: '#c9d1d9',
                    cursor: '#58a6ff',
                    selectionBackground: '#264f7844',
                    black: '#0d1117',
                    red: '#ff7b72',
                    green: '#7ee787',
                    yellow: '#ffa657',
                    blue: '#79c0ff',
                    magenta: '#d2a8ff',
                    cyan: '#a5d6ff',
                    white: '#c9d1d9',
                },
                fontFamily: '"Cascadia Code", "Fira Code", Consolas, monospace',
                fontSize: 13,
                cursorBlink: true,
                cursorStyle: 'bar',
                lineHeight: 1.2,
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(container);

            setTimeout(() => {
                try {
                    if (container.getBoundingClientRect().width > 0) fitAddon.fit();
                } catch { }
            }, 50);

            xtermRef.current = term;
            fitAddonRef.current = fitAddon;

            term.writeln('\x1b[38;5;39m╭─────────────────────────────────────╮\x1b[0m');
            term.writeln('\x1b[38;5;39m│\x1b[0m  \x1b[1;37mOptimus Studio Terminal\x1b[0m          \x1b[38;5;39m│\x1b[0m');
            term.writeln('\x1b[38;5;39m╰─────────────────────────────────────╯\x1b[0m');
            term.write('\r\n$ ');

            term.onData(e => {
                if (e === '\r') {
                    term!.write('\r\n');
                    handleCommand(inputBufferRef.current);
                    inputBufferRef.current = '';
                } else if (e === '\u007F') {
                    if (inputBufferRef.current.length > 0) {
                        inputBufferRef.current = inputBufferRef.current.slice(0, -1);
                        term!.write('\b \b');
                    }
                } else if (e === '\u0003') {
                    term!.write('^C\r\n$ ');
                    inputBufferRef.current = '';
                } else if (e >= ' ') {
                    inputBufferRef.current += e;
                    term!.write(e);
                }
            });

            const onResize = () => {
                try {
                    if (container.getBoundingClientRect().width > 0) fitAddon.fit();
                } catch { }
            };
            window.addEventListener('resize', onResize);

            return () => window.removeEventListener('resize', onResize);
        };

        init();

        return () => {
            disposed = true;
            term?.dispose();
        };
    }, [isReady, handleCommand]);

    return (
        <div className="h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden border border-[#30363d]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                        <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                    </div>
                    <span className="ml-3 text-xs text-[#8b949e] font-medium">Terminal</span>
                </div>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                    <button className="p-1.5 hover:bg-[#30363d] rounded text-[#8b949e] hover:text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </button>
                </div>
            </div>
            <div ref={terminalRef} className="flex-1 p-2" style={{ minHeight: '200px' }} />
        </div>
    );
}

export default RealTerminal;
