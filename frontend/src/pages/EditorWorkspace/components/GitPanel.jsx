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
            <div className="flex flex-col h-full bg-surface-container-lowest border-r border-outline-variant/20 p-4">
                <h2 className="text-[11px] font-label-sm uppercase tracking-widest text-on-surface-variant mb-4">Source Control</h2>
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
                    <span className="material-symbols-outlined text-[32px] text-on-surface-variant/50">account_tree</span>
                    <p className="text-[12px] text-on-surface-variant">No Git repository initialized in this workspace.</p>
                    <button 
                        onClick={handleInit}
                        disabled={loading}
                        className="mt-2 bg-primary text-on-primary px-4 py-1.5 rounded-lg text-[12px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
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
        <div className="flex flex-col h-full bg-surface-container-lowest border-r border-outline-variant/20 overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-outline-variant/20 shrink-0">
                <h2 className="text-[11px] font-label-sm uppercase tracking-widest text-on-surface-variant">Source Control</h2>
                <button onClick={fetchStatus} className="text-on-surface-variant hover:text-on-surface" title="Refresh">
                    <span className={`material-symbols-outlined text-[14px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                </button>
            </div>

            <div className="p-3 border-b border-outline-variant/20 shrink-0">
                <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    placeholder="Message (Ctrl+Enter to commit)"
                    className="w-full bg-black/20 border border-outline-variant/30 rounded focus:border-primary/50 focus:outline-none p-2 text-[12px] text-on-surface placeholder:text-on-surface-variant/50 resize-none"
                    rows={3}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') handleCommit();
                    }}
                />
                <button
                    onClick={handleCommit}
                    disabled={loading || !commitMessage.trim() || !hasChanges}
                    className="w-full mt-2 bg-primary text-on-primary py-1.5 rounded text-[12px] font-medium hover:brightness-110 disabled:opacity-50 transition-all"
                >
                    Commit
                </button>
                {error && <p className="text-red-400 text-[11px] mt-2">{error}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {status && !hasChanges && (
                    <div className="text-center mt-6 text-[12px] text-on-surface-variant">
                        No pending changes.
                    </div>
                )}
                
                {hasChanges && (
                    <div className="flex flex-col gap-1">
                        <div className="px-1 py-1 text-[10px] uppercase font-bold text-on-surface-variant flex items-center justify-between">
                            <span>Changes</span>
                            <span className="bg-surface-variant px-1.5 rounded-full">{
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
    <div onClick={onClick} className="flex items-center justify-between py-1 px-2 hover:bg-surface-variant/30 rounded cursor-pointer group">
        <span className="text-[12px] text-on-surface truncate pr-2">{file}</span>
        <span className={`text-[10px] font-bold ${color} opacity-80 group-hover:opacity-100 shrink-0`}>{state}</span>
    </div>
);

export default GitPanel;
