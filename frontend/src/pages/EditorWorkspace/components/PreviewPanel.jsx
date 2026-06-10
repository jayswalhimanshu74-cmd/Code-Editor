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
        <div className="flex flex-col h-full bg-[#1e1e2e]">
            {/* Header / Address Bar */}
            <div className="flex items-center px-3 py-2 bg-[#181825] border-b border-[#313244] shrink-0 gap-2">
                <div className="flex bg-[#1e1e2e] border border-[#313244] rounded overflow-hidden shadow-sm items-center flex-1 max-w-xl">
                    <span className="px-3 text-[#bac2de] text-xs border-r border-[#313244] bg-[#181825]">Port</span>
                    <input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        placeholder="3000"
                        className="bg-transparent border-none outline-none text-[#cdd6f4] text-xs px-3 py-1 w-20"
                        onKeyDown={(e) => e.key === 'Enter' && fetchMappedPort()}
                    />
                    <div className="flex-1 px-3 text-xs text-[#a6adc8] truncate bg-[#1e1e2e] flex items-center h-full border-l border-[#313244]">
                        {mappedPort ? `http://localhost:${mappedPort}` : 'Enter port and press Enter or Connect'}
                    </div>
                </div>

                <button 
                    onClick={fetchMappedPort}
                    className="p-1.5 hover:bg-[#313244] rounded text-[#bac2de] transition-colors ml-auto flex items-center justify-center text-xs px-3 border border-[#313244]"
                    disabled={loading}
                >
                    {loading ? 'Connecting...' : 'Connect'}
                </button>

                <button 
                    onClick={handleRefresh}
                    className="p-1.5 hover:bg-[#313244] rounded text-[#bac2de] transition-colors flex items-center justify-center"
                    title="Refresh Preview"
                >
                    <span className="material-symbols-outlined text-[16px]">refresh</span>
                </button>
                <button 
                    onClick={handleOpenExternal}
                    className="p-1.5 hover:bg-[#313244] rounded text-[#bac2de] transition-colors flex items-center justify-center"
                    title="Open in new tab"
                    disabled={!mappedPort}
                >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </button>
            </div>

            {/* Iframe Content */}
            <div className="flex-1 relative bg-white">
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e2e] text-[#f38ba8] p-6 text-center">
                        <span className="material-symbols-outlined text-4xl mb-2">error</span>
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {!error && !mappedPort && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e1e2e] text-[#bac2de] p-6 text-center">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">web</span>
                        <p className="text-sm">Start your web server in the terminal and enter the port above to preview it.</p>
                        <p className="text-xs opacity-60 mt-2">Common ports: 3000, 5000, 5173, 8080</p>
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
