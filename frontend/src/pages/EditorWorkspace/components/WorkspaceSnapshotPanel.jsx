import React, { useState, useEffect } from 'react';
import { Camera, Clock, Play, Trash2, Loader, ArchiveRestore } from 'lucide-react';
import api from '../../../api/axios';

const WorkspaceSnapshotPanel = ({ roomId }) => {
    const [snapshots, setSnapshots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null); // ID of snapshot being restored/deleted
    const [newSnapshotName, setNewSnapshotName] = useState('');
    const [newSnapshotDesc, setNewSnapshotDesc] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchSnapshots();
    }, [roomId]);

    const fetchSnapshots = async () => {
        try {
            const response = await api.get(`/workspaces/${roomId}/snapshots`);
            setSnapshots(response.data);
        } catch (error) {
            console.error('Failed to fetch snapshots', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSnapshot = async (e) => {
        e.preventDefault();
        if (!newSnapshotName.trim()) return;

        setActionLoading('creating');
        try {
            await api.post(`/workspaces/${roomId}/snapshots`, {
                name: newSnapshotName,
                description: newSnapshotDesc
            });
            setNewSnapshotName('');
            setNewSnapshotDesc('');
            setShowCreateForm(false);
            fetchSnapshots();
        } catch (error) {
            console.error('Failed to create snapshot', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRestoreSnapshot = async (snapshotId) => {
        if (!window.confirm("Restoring a snapshot will wipe all current workspace progress. Are you sure?")) return;
        
        setActionLoading(`restoring-${snapshotId}`);
        try {
            await api.post(`/workspaces/${roomId}/snapshots/${snapshotId}/restore`);
            alert("Workspace restored successfully! You may need to refresh the page.");
            window.location.reload();
        } catch (error) {
            console.error('Failed to restore snapshot', error);
            alert("Failed to restore snapshot.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteSnapshot = async (snapshotId) => {
        if (!window.confirm("Are you sure you want to delete this snapshot?")) return;
        
        setActionLoading(`deleting-${snapshotId}`);
        try {
            await api.delete(`/workspaces/${roomId}/snapshots/${snapshotId}`);
            fetchSnapshots();
        } catch (error) {
            console.error('Failed to delete snapshot', error);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full text-[#a6adc8]">
                <Loader className="w-5 h-5 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#1e1e2e] text-[#cdd6f4]">
            <div className="p-4 border-b border-[#313244] flex justify-between items-center">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[#a6adc8] flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Snapshots
                </h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="p-1.5 hover:bg-[#313244] rounded text-[#89b4fa] transition-colors"
                    title="Take Snapshot"
                >
                    <Camera className="w-4 h-4" />
                </button>
            </div>

            {showCreateForm && (
                <form onSubmit={handleCreateSnapshot} className="p-4 border-b border-[#313244] bg-[#181825]">
                    <input
                        type="text"
                        placeholder="Snapshot Name"
                        value={newSnapshotName}
                        onChange={(e) => setNewSnapshotName(e.target.value)}
                        className="w-full bg-[#313244] text-xs p-2 rounded border border-[#45475a] focus:border-[#89b4fa] outline-none mb-2"
                        autoFocus
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={newSnapshotDesc}
                        onChange={(e) => setNewSnapshotDesc(e.target.value)}
                        className="w-full bg-[#313244] text-xs p-2 rounded border border-[#45475a] focus:border-[#89b4fa] outline-none mb-3"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowCreateForm(false)}
                            className="px-3 py-1.5 text-xs text-[#a6adc8] hover:text-[#cdd6f4]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!newSnapshotName.trim() || actionLoading === 'creating'}
                            className="px-3 py-1.5 text-xs bg-[#89b4fa] text-[#1e1e2e] rounded hover:bg-[#89b4fa]/90 disabled:opacity-50 flex items-center gap-1 font-medium"
                        >
                            {actionLoading === 'creating' ? <Loader className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                            Create
                        </button>
                    </div>
                </form>
            )}

            <div className="flex-1 overflow-y-auto">
                {snapshots.length === 0 ? (
                    <div className="p-8 text-center text-[#6c7086] text-sm">
                        <Camera className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No snapshots yet.</p>
                        <p className="text-xs mt-1">Capture your workspace state to restore it later.</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {snapshots.map((snapshot) => (
                            <div key={snapshot.id} className="p-3 bg-[#181825] rounded border border-[#313244] hover:border-[#45475a] transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-medium text-[#cdd6f4] break-all">{snapshot.name}</h3>
                                </div>
                                {snapshot.description && (
                                    <p className="text-xs text-[#a6adc8] mb-3 line-clamp-2">{snapshot.description}</p>
                                )}
                                <div className="flex items-center text-[10px] text-[#6c7086] mb-3 gap-1">
                                    <Clock className="w-3 h-3" /> {formatDate(snapshot.createdAt)}
                                </div>
                                <div className="flex gap-2 pt-2 border-t border-[#313244]">
                                    <button
                                        onClick={() => handleRestoreSnapshot(snapshot.id)}
                                        disabled={actionLoading !== null}
                                        className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs bg-[#313244] hover:bg-[#89b4fa] hover:text-[#1e1e2e] text-[#cdd6f4] rounded transition-colors disabled:opacity-50"
                                        title="Restore Snapshot"
                                    >
                                        {actionLoading === `restoring-${snapshot.id}` ? (
                                            <Loader className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <ArchiveRestore className="w-3.5 h-3.5" />
                                        )}
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSnapshot(snapshot.id)}
                                        disabled={actionLoading !== null}
                                        className="p-1.5 bg-[#313244] hover:bg-[#f38ba8] hover:text-[#1e1e2e] text-[#f38ba8] rounded transition-colors disabled:opacity-50"
                                        title="Delete Snapshot"
                                    >
                                        {actionLoading === `deleting-${snapshot.id}` ? (
                                            <Loader className="w-3.5 h-3.5 animate-spin text-[#cdd6f4]" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspaceSnapshotPanel;
