'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Terminal } from 'xterm';
import type { FitAddon } from 'xterm-addon-fit';

interface TerminalInstanceProps {
    id: string;
    isActive: boolean;
    onReady?: (term: Terminal) => void;
}

export function TerminalInstance({ id, isActive, onReady }: TerminalInstanceProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            terminalRef.current?.dispose();
        };
    }, []);

    useEffect(() => {
        if (!isMounted || !containerRef.current || terminalRef.current) return;

        const initTerminal = async () => {
            const { Terminal } = await import('xterm');
            const { FitAddon } = await import('xterm-addon-fit');
            try {
                // @ts-ignore
                await import('xterm/css/xterm.css');
            } catch (e) {
                console.warn('Failed to load xterm styles', e);
            }

            const term = new Terminal({
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
                allowProposedApi: true
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);

            term.open(containerRef.current!);
            fitAddon.fit();

            term.write(`\r\n\x1b[36m⚡ Optimus Terminal (${id})\x1b[0m\r\n\r\n$ `);

            // Mock interaction for now
            term.onData(e => {
                if (e === '\r') {
                    term.write('\r\n$ ');
                } else if (e === '\u007F') { // Backspace
                    term.write('\b \b');
                } else {
                    term.write(e);
                }
            });

            terminalRef.current = term;
            fitAddonRef.current = fitAddon;

            if (onReady) onReady(term);
        };

        initTerminal();
    }, [isMounted, id, onReady]);

    // Handle resizing when active state changes or window resizes
    useEffect(() => {
        if (isActive && fitAddonRef.current) {
            // Short delay to allow layout to settle
            setTimeout(() => {
                fitAddonRef.current?.fit();
            }, 50);
        }
    }, [isActive]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                display: isActive ? 'block' : 'none'
            }}
        />
    );
}
