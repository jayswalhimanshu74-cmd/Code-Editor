import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const TerminalPanel = ({ roomId }) => {
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
                background: '#1e1e2e',
                foreground: '#cdd6f4',
                cursor: '#f38ba8',
                selection: '#585b70'
            },
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            cursorBlink: true
        });

        const fitAddon = new FitAddon();
        // Delay term.open to guarantee React has flushed the DOM
        setTimeout(() => {
            if (!terminalRef.current) return;
            try {
                term.open(terminalRef.current);
                
                // Use ResizeObserver for robust fitting
                const resizeObserver = new ResizeObserver(() => {
                    if (terminalRef.current && terminalRef.current.clientHeight > 0 && term.element) {
                        try {
                            fitAddon.fit();
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
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Assuming backend is on port 8080 during dev
        const wsUrl = `${wsProtocol}//localhost:8080/ws/terminal?roomId=${roomId}`;
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            term.writeln('\x1b[32m[✓] Connected to Cloud IDE Container Workspace\x1b[0m');
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
            if (terminalRef.current?._resizeObserver) {
                terminalRef.current._resizeObserver.disconnect();
            }
            ws.close();
            term.dispose();
        };
    }, [roomId]);

    return (
        <div className="flex flex-col h-full bg-[#1e1e2e]">
            <div className="flex items-center px-3 py-1.5 bg-[#181825] border-b border-[#313244] shrink-0 gap-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-[11px] text-[#bac2de] font-mono">
                    {connected ? 'workspace-active' : 'disconnected'}
                </span>
            </div>
            <div className="flex-1 overflow-hidden p-2 relative min-h-[100px] min-w-[100px]" ref={terminalRef}>
                {/* XTerm will inject canvas/div elements here */}
            </div>
        </div>
    );
};

export default TerminalPanel;
