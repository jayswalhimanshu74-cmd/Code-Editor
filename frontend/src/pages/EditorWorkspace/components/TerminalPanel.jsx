import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import useAuthStore from '../../../store/authStore';

const TerminalPanel = ({ roomId }) => {
    const { user } = useAuthStore();
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const wsRef = useRef(null);
    const fitAddonRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!roomId || !terminalRef.current) return;

        // Initialize XTerm
        const term = new Terminal({
            theme: {
                background: '#000000',
                foreground: '#cdd6f4',
                cursor: '#0070f3',
                selection: 'rgba(255, 255, 255, 0.15)'
            },
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            cursorBlink: true
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        // Delay term.open to guarantee React has flushed the DOM
        const openTimeout = setTimeout(() => {
            if (!terminalRef.current) return;
            try {
                term.open(terminalRef.current);
                
                // Use ResizeObserver for robust fitting
                const resizeObserver = new ResizeObserver(() => {
                    if (terminalRef.current && terminalRef.current.clientWidth > 0 && terminalRef.current.clientHeight > 0 && term.element) {
                        try {
                            fitAddon.fit();
                            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                wsRef.current.send(JSON.stringify({
                                    type: 'resize',
                                    cols: term.cols,
                                    rows: term.rows
                                }));
                            }
                        } catch (e) {}
                    }
                });
                resizeObserver.observe(terminalRef.current);

                // Cleanup observer
                terminalRef.current._resizeObserver = resizeObserver;
            } catch (e) {
                console.error("XTerm open failed", e);
            }
        }, 50);

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Connect to raw WebSocket on backend
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        const wsProtocol = baseUrl.startsWith('https') ? 'wss:' : 'ws:';
        const host = baseUrl.replace(/^https?:\/\//, '');
        let wsUrl = `${wsProtocol}//${host}/ws/terminal?roomId=${roomId}`;
        if (user) {
            wsUrl += `&username=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`;
        }
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            term.reset();
            term.writeln('\x1b[32m[✓] Connected to Cloud IDE Container Workspace\x1b[0m');
            // Send initial size
            try {
                ws.send(JSON.stringify({
                    type: 'resize',
                    cols: term.cols,
                    rows: term.rows
                }));
            } catch (e) {}
        };

        ws.onmessage = (event) => {
            term.write(event.data);
        };

        ws.onclose = () => {
            setConnected(false);
            term.writeln('\r\n\x1b[31m[!] Disconnected from Workspace\x1b[0m');
        };

        ws.onerror = () => {
            term.writeln('\r\n\x1b[31m[!] Connection Error\x1b[0m');
        };

        // When user types, send to WebSocket
        term.onData((data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data);
            }
        });

        return () => {
            clearTimeout(openTimeout);
            if (terminalRef.current?._resizeObserver) {
                terminalRef.current._resizeObserver.disconnect();
            }
            ws.close();
            term.dispose();
            if (terminalRef.current) {
                terminalRef.current.innerHTML = '';
            }
        };
    }, [roomId]);

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex items-center px-4 py-2 bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0 gap-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-red-400 shadow-[0_0_8px_#f87171]'}`} />
                <span className="text-[11px] text-white/50 font-mono">
                    {connected ? 'workspace-active' : 'disconnected'}
                </span>
            </div>
            <div className="flex-1 overflow-hidden p-2 bg-black">
                <div className="w-full h-full relative" ref={terminalRef}>
                    {/* XTerm will inject canvas/div elements here */}
                </div>
            </div>
        </div>
    );
};

export default TerminalPanel;
