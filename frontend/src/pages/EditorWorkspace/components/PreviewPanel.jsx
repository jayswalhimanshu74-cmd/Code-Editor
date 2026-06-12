import React, { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';

const PreviewPanel = ({ roomId }) => {
    const [port, setPort] = useState('3000');
    const [mappedPort, setMappedPort] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const iframeRef = useRef(null);

    const fetchMappedPort = async () => {
        if (!port) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/rooms/${roomId}/ports/${port}`);
            setMappedPort(response.data);
        } catch (err) {
            console.error(err);
            setError(`Port ${port} is not available. Ensure your server is running on port ${port} inside the terminal.`);
            setMappedPort(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (iframeRef.current && mappedPort) {
            iframeRef.current.src = iframeRef.current.src;
        } else {
            fetchMappedPort();
        }
    };

    const handleOpenExternal = () => {
        if (mappedPort) {
            window.open(`http://localhost:${mappedPort}`, '_blank');
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Header / Address Bar */}
            <div className="flex items-center px-4 py-2 bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0 gap-2">
                <div className="flex bg-black/45 border border-white/10 rounded-lg overflow-hidden shadow-sm items-center flex-1 max-w-xl">
                    <span className="px-3 text-white/50 text-xs border-r border-white/10 bg-black/25 py-1">Port</span>
                    <input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="3000"
                        className="bg-transparent border-none outline-none text-white text-xs px-3 py-1 w-20 placeholder:text-white/20"
                        onKeyDown={(e) => e.key === 'Enter' && fetchMappedPort()}
                    />
                    <div className="flex-1 px-3 py-1 text-xs text-white/60 truncate bg-black/25 flex items-center h-full border-l border-white/10">
                        {mappedPort ? `http://localhost:${mappedPort}` : 'Enter port and press Enter or Connect'}
                    </div>
                </div>

                <button 
                    onClick={fetchMappedPort}
                    className="bg-gradient-to-r from-[#0070f3] to-[#00f0ff] hover:brightness-110 text-white rounded-lg transition-colors ml-auto flex items-center justify-center text-xs px-4 py-1.5 font-bold hover:shadow-[0_0_15px_rgba(0,112,243,0.3)]"
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Connect'}
                </button>

                <button 
                    onClick={handleRefresh}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors flex items-center justify-center"
                    title="Refresh Preview"
                >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                </button>
                <button 
                    onClick={handleOpenExternal}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors flex items-center justify-center"
                    title="Open in new tab"
                    disabled={!mappedPort}
                >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
            </div>

            {/* Iframe Content */}
            <div className="flex-1 relative bg-white">
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-red-400 p-6 text-center backdrop-blur-md">
                        <span className="material-symbols-outlined text-4xl mb-2">error</span>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
                {!error && !mappedPort && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 text-white/70 p-6 text-center backdrop-blur-md">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-40">web</span>
                        <p className="text-sm font-semibold">Start your web server in the terminal and enter the port above to preview it.</p>
                        <p className="text-xs text-white/40 mt-2">Common ports: 3000, 5000, 5173, 8080</p>
                    </div>
                )}
                {mappedPort && (
                    <iframe
                        ref={iframeRef}
                        src={`http://localhost:${mappedPort}`}
                        title="Preview Window"
                        className="w-full h-full border-none bg-white"
                        sandbox="allow-same-origin allow-scripts allow-forms"
                    />
                )}
            </div>
        </div>
    );
};

export default PreviewPanel;
