import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const GitPanel = ({ roomId, onFileDiff }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');
    const [error, setError] = useState('');

    const fetchStatus = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/git/${roomId}/status`);
            setStatus(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch Git status');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (roomId) fetchStatus();
    }, [roomId]);

    const handleInit = async () => {
        setLoading(true);
        try {
            await api.post(`/git/${roomId}/init`);
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError('Failed to initialize repository');
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!commitMessage.trim()) return;
        setLoading(true);
        try {
            await api.post(`/git/${roomId}/commit`, { message: commitMessage });
            setCommitMessage('');
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError('Failed to commit changes');
            setLoading(false);
        }
    };

    if (loading && !status) {
        return (
            <div className="p-4 text-[12px] text-on-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Loading Source Control...
            </div>
        );
    }

    if (status && !status.isRepo) {
        return (
            <div className="flex flex-col h-full bg-transparent p-4">
                <h2 className="text-[11px] font-label-sm uppercase tracking-widest text-white/50 mb-4">Source Control</h2>
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <span className="material-symbols-outlined text-[32px] text-white/30">account_tree</span>
                    <p className="text-[12px] text-white/60">No Git repository initialized in this workspace.</p>
                    <button 
                        onClick={handleInit}
                        disabled={loading}
                        className="mt-2 bg-gradient-to-r from-[#0070f3] to-[#00f0ff] hover:brightness-110 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:shadow-[0_0_15px_rgba(0,112,243,0.3)] disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Initializing...' : 'Initialize Repository'}
                    </button>
                    {error && <p className="text-red-400 text-[11px] mt-2">{error}</p>}
                </div>
            </div>
        );
    }

    const hasChanges = status && (
        (status.added && status.added.length > 0) ||
        (status.changed && status.changed.length > 0) ||
        (status.modified && status.modified.length > 0) ||
        (status.removed && status.removed.length > 0) ||
        (status.untracked && status.untracked.length > 0)
    );

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-white/10 shrink-0">
                <h2 className="text-[11px] font-label-sm uppercase tracking-widest text-white/50">Source Control</h2>
                <button onClick={fetchStatus} className="text-white/60 hover:text-white" title="Refresh">
                    <span className={`material-symbols-outlined text-[14px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                </button>
            </div>

            <div className="p-3 border-b border-white/10 shrink-0">
                <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Message (Ctrl+Enter to commit)"
                    className="w-full bg-black/45 border border-white/10 rounded focus:border-[#0070f3]/50 focus:outline-none p-2 text-[12px] text-white placeholder:text-white/30 resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') handleCommit();
                    }}
                />
                <button
                    onClick={handleCommit}
                    disabled={loading || !commitMessage.trim() || !hasChanges}
                    className="w-full mt-2 bg-gradient-to-r from-[#0070f3] to-[#00f0ff] hover:brightness-110 text-white py-1.5 rounded-lg text-[12px] font-bold hover:shadow-[0_0_15px_rgba(0,112,243,0.3)] disabled:opacity-50 transition-all"
                >
                    Commit
                </button>
                {error && <p className="text-red-400 text-[11px] mt-2">{error}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {status && !hasChanges && (
                    <div className="text-center mt-6 text-[12px] text-white/40">
                        No pending changes.
                    </div>
                )}
                
                {hasChanges && (
                    <div className="flex flex-col gap-1">
                        <div className="px-1 py-1 text-[10px] uppercase font-bold text-white/50 flex items-center justify-between">
                            <span>Changes</span>
                            <span className="bg-white/10 px-1.5 rounded-full text-white/75">{
                                (status.added?.length || 0) + (status.modified?.length || 0) + (status.untracked?.length || 0) + (status.removed?.length || 0)
                            }</span>
                        </div>
                        
                        {status.added?.map(f => <FileItem key={f} file={f} state="A" color="text-green-400" onClick={() => onFileDiff && onFileDiff(f)} />)}
                        {status.modified?.map(f => <FileItem key={f} file={f} state="M" color="text-yellow-400" onClick={() => onFileDiff && onFileDiff(f)} />)}
                        {status.untracked?.map(f => <FileItem key={f} file={f} state="U" color="text-green-400" onClick={() => onFileDiff && onFileDiff(f)} />)}
                        {status.removed?.map(f => <FileItem key={f} file={f} state="D" color="text-red-400" onClick={() => onFileDiff && onFileDiff(f)} />)}
                    </div>
                )}
            </div>
        </div>
    );
};

const FileItem = ({ file, state, color, onClick }) => (
    <div onClick={onClick} className="flex items-center justify-between py-1 px-2 hover:bg-white/5 rounded cursor-pointer group">
        <span className="text-[12px] text-white/85 truncate pr-2">{file}</span>
        <span className={`text-[10px] font-bold ${color} opacity-80 group-hover:opacity-100 shrink-0`}>{state}</span>
    </div>
);

export default GitPanel;
