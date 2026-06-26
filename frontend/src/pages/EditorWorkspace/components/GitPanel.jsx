import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const GitPanel = ({ roomId, onFileDiff }) => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [commitMessage, setCommitMessage] = useState('');
    const [cloneUrl, setCloneUrl] = useState('');
    const [branches, setBranches] = useState([]);
    const [currentBranch, setCurrentBranch] = useState('');
    const [newBranchName, setNewBranchName] = useState('');
    const [showNewBranchInput, setShowNewBranchInput] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchStatus = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await api.get(`/git/${roomId}/status`);
            setStatus(data);
            if (data.isRepo) {
                await fetchBranches();
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch Git status');
        } finally {
            setLoading(false);
        }
    };

    const fetchBranches = async () => {
        try {
            const { data } = await api.get(`/git/${roomId}/branches`);
            setBranches(data);
            const activeRef = data.find(ref => !ref.startsWith('refs/remotes/')) || data[0];
            if (activeRef) {
                const parts = activeRef.split('/');
                setCurrentBranch(parts[parts.length - 1]);
            }
        } catch (err) {
            console.error('Failed to fetch branches', err);
        }
    };

    useEffect(() => {
        if (roomId) fetchStatus();
    }, [roomId]);

    const handleInit = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post(`/git/${roomId}/init`);
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError('Failed to initialize repository');
            setLoading(false);
        }
    };

    const handleClone = async () => {
        if (!cloneUrl.trim()) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/git/${roomId}/clone`, { repoUrl: cloneUrl });
            setMessage('Repository cloned successfully!');
            setCloneUrl('');
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError('Failed to clone repository. Ensure the URL is valid.');
            setLoading(false);
        }
    };

    const handleCommit = async () => {
        if (!commitMessage.trim()) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/git/${roomId}/commit`, { message: commitMessage });
            setCommitMessage('');
            setMessage('Changes committed successfully!');
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError('Failed to commit changes');
            setLoading(false);
        }
    };

    const handlePull = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/git/${roomId}/pull`);
            setMessage('Pulled successfully!');
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError('Failed to pull changes.');
            setLoading(false);
        }
    };

    const handlePush = async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/git/${roomId}/push`);
            setMessage('Pushed successfully!');
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError('Failed to push changes.');
            setLoading(false);
        }
    };

    const handleCheckoutBranch = async (branchRefName) => {
        setLoading(true);
        setError('');
        setMessage('');
        const branchNameOnly = branchRefName.replace('refs/heads/', '').replace('refs/remotes/origin/', '');
        try {
            await api.post(`/git/${roomId}/branches/checkout`, { branchName: branchNameOnly });
            setMessage(`Switched to branch: ${branchNameOnly}`);
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError(`Failed to switch to branch ${branchNameOnly}`);
            setLoading(false);
        }
    };

    const handleCreateBranch = async () => {
        if (!newBranchName.trim()) return;
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post(`/git/${roomId}/branches/create`, { branchName: newBranchName });
            setMessage(`Branch ${newBranchName} created!`);
            setShowNewBranchInput(false);
            setNewBranchName('');
            await fetchStatus();
        } catch (err) {
            console.error(err);
            setError(`Failed to create branch ${newBranchName}`);
            setLoading(false);
        }
    };

    if (loading && !status) {
        return (
            <div className="p-4 text-[12px] text-white/60 flex items-center justify-center">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Loading Source Control...
            </div>
        );
    }

    if (status && !status.isRepo) {
        return (
            <div className="flex flex-col h-full bg-transparent p-4 overflow-y-auto">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-4">Source Control</h2>
                <div className="flex flex-col items-center justify-center text-center gap-3">
                    <span className="material-symbols-outlined text-[32px] text-white/30">account_tree</span>
                    <p className="text-[12px] text-white/60">No Git repository initialized in this workspace.</p>
                    
                    <button 
                        onClick={handleInit}
                        disabled={loading}
                        className="w-full mt-2 bg-gradient-to-r from-[#0070f3] to-[#00f0ff] hover:brightness-110 text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:shadow-[0_0_15px_rgba(0,112,243,0.3)] disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Initializing...' : 'Initialize Local Repository'}
                    </button>

                    <div className="w-full flex items-center gap-2 my-2 text-[10px] text-white/40 uppercase font-bold">
                        <hr className="flex-1 border-white/10" />
                        <span>OR</span>
                        <hr className="flex-1 border-white/10" />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder="Git Remote URL (https://...)"
                            value={cloneUrl}
                            onChange={(e) => setCloneUrl(e.target.value)}
                            className="w-full bg-black/45 border border-white/10 rounded focus:border-[#0070f3]/50 focus:outline-none px-3 py-1.5 text-[12px] text-white placeholder:text-white/30"
                        />
                        <button 
                            onClick={handleClone}
                            disabled={loading || !cloneUrl.trim()}
                            className="w-full bg-white/10 hover:bg-white/15 text-white px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all disabled:opacity-50"
                        >
                            {loading ? 'Cloning...' : 'Clone Repository'}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-[11px] mt-2 w-full text-left">{error}</p>}
                    {message && <p className="text-green-400 text-[11px] mt-2 w-full text-left">{message}</p>}
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
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-white/50">Source Control</h2>
                <div className="flex items-center gap-2">
                    <button onClick={fetchStatus} className="text-white/60 hover:text-white" title="Refresh">
                        <span className={`material-symbols-outlined text-[14px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10 shrink-0 gap-2">
                <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                    <span className="material-symbols-outlined text-[14px] text-white/50 shrink-0">schema</span>
                    {showNewBranchInput ? (
                        <input
                            type="text"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                            placeholder="Branch name"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateBranch();
                                if (e.key === 'Escape') setShowNewBranchInput(false);
                            }}
                            className="bg-black/30 border border-white/15 rounded text-[11px] px-1.5 py-0.5 text-white w-full focus:outline-none"
                            autoFocus
                        />
                    ) : (
                        <select
                            value={branches.find(b => b.endsWith(currentBranch)) || ''}
                            onChange={(e) => handleCheckoutBranch(e.target.value)}
                            className="bg-transparent border-none text-[11px] text-white/80 font-medium focus:outline-none cursor-pointer truncate max-w-[120px]"
                        >
                            {branches.map(ref => {
                                const name = ref.split('/').pop();
                                return (
                                    <option key={ref} value={ref} className="bg-[#181818] text-white">
                                        {name} {ref.startsWith('refs/remotes/') ? '(remote)' : ''}
                                    </option>
                                );
                            })}
                        </select>
                    )}
                    {!showNewBranchInput && (
                        <button
                            onClick={() => setShowNewBranchInput(true)}
                            className="text-white/50 hover:text-white shrink-0"
                            title="New Branch"
                        >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={handlePull}
                        disabled={loading}
                        className="flex items-center justify-center p-1 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-50"
                        title="Pull Changes"
                    >
                        <span className="material-symbols-outlined text-[15px]">download</span>
                    </button>
                    <button
                        onClick={handlePush}
                        disabled={loading}
                        className="flex items-center justify-center p-1 rounded hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-50"
                        title="Push Changes"
                    >
                        <span className="material-symbols-outlined text-[15px]">upload</span>
                    </button>
                </div>
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
                {message && <p className="text-green-400 text-[11px] mt-2">{message}</p>}
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
