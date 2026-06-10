import React, { useEffect, useState } from 'react';
import useRoomStore from '../../store/roomStore';
import { logService } from '../../api/logService';
import { wsService } from '../../api/websocketService';


const ACTION_META = {
    EDIT:   { icon: 'edit',         color: 'text-blue-400 bg-blue-400/10',   label: 'Edited'  },
    CREATE: { icon: 'add_circle',   color: 'text-green-400 bg-green-400/10', label: 'Created' },
    DELETE: { icon: 'delete',       color: 'text-red-400 bg-red-400/10',     label: 'Deleted' },
    RENAME: { icon: 'drive_file_rename_outline', color: 'text-yellow-400 bg-yellow-400/10', label: 'Renamed' },
    JOIN:   { icon: 'login',        color: 'text-emerald-400 bg-emerald-400/10', label: 'Joined' },
    LEAVE:  { icon: 'logout',       color: 'text-orange-400 bg-orange-400/10', label: 'Left' },
};

const parseDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) {
        const [y, m, day, h = 0, min = 0, s = 0] = d;
        return new Date(y, m - 1, day, h, min, s);
    }
    return new Date(d);
};

const LogRow = ({ entry }) => {
    const [expanded, setExpanded] = useState(false);
    const meta = ACTION_META[entry.actionType] || ACTION_META.EDIT;
    const date = parseDate(entry.changedAt);

    return (
        <div className="glass-card rounded-xl border border-outline-variant/20 hover:border-primary/20 overflow-hidden transition-all">
            <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-surface-variant/10"
                onClick={() => entry.actionType === 'EDIT' && setExpanded(v => !v)}
            >
                {/* Action badge */}
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${meta.color}`}>
                    <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                    {meta.label}
                </span>

                {/* File name */}
                <span className="text-on-surface text-[12px] font-mono truncate flex-1">
                    {entry.fileName || "Room"}
                </span>

                {/* User */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[9px] font-bold text-primary">
                        {entry.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-on-surface-variant text-[11px] hidden sm:block">
                        {entry.username}
                    </span>
                </div>

                {/* Time */}
                <span className="text-on-surface-variant text-[10px] flex-shrink-0 hidden md:block">
                    {date?.toLocaleString() ?? '—'}
                </span>

                {entry.actionType === 'EDIT' && (
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant transition-transform"
                        style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
                        expand_more
                    </span>
                )}
            </div>

            {/* Expanded snapshot */}
            {expanded && entry.contentSnapshot && (
                <div className="border-t border-outline-variant/20 px-4 py-3 bg-black/20">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-2">
                        Content at this point
                    </p>
                    <pre className="text-on-surface text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                        {entry.contentSnapshot}
                    </pre>
                </div>
            )}
        </div>
    );
};

const ActivityLog = () => {
    const { rooms, fetchRooms } = useRoomStore();
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filterAction, setFilterAction] = useState('ALL');
    const [filterUser, setFilterUser] = useState('ALL');
    const [error, setError] = useState('');

    useEffect(() => { fetchRooms(); }, []);

    useEffect(() => {
        if (rooms.length > 0 && !selectedRoomId) setSelectedRoomId(rooms[0].id);
    }, [rooms]);

    useEffect(() => {
        if (!wsService.isConnected()) {
            wsService.connect(
                () => console.log('ActivityLog WS Connected'),
                () => console.log('ActivityLog WS Disconnected')
            );
        }
        return () => {
            // Disconnect if we navigate away and aren't in editor
            // Actually wsService is a singleton so we shouldn't necessarily disconnect it globally
            // if the user is using multiple tabs, but SockJS handles its own connections
        };
    }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    setIsLoading(true);
    setError('');                           // ← add this
    logService.getRoomLogs(selectedRoomId, page, 50)
        .then(({ data }) => {
            setLogs(data.content ?? []);        // ← safe fallback
            setTotalPages(data.totalPages ?? 0);
        })
        .catch((err) => {
            console.error(err);
            setError('Failed to load activity log'); // ← show the error
        })
        .finally(() => setIsLoading(false));

    // Subscribe to real-time events via STOMP/Redis
    if (wsService.isConnected()) {
        const unsub = wsService.subscribe(`/topic/room/${selectedRoomId}/activity`, (newLog) => {
            setLogs(prev => {
                // To avoid duplicate keys, check if log already exists
                if (prev.some(l => l.id === newLog.id)) return prev;
                return [newLog, ...prev];
            });
        });
        return () => unsub?.();
    }
}, [selectedRoomId, page]);
    // unique users from current page
    const users = ['ALL', ...new Set(logs.map(l => l.username))];

    const filtered = logs.filter(l => {
        const actionMatch = filterAction === 'ALL' || l.actionType === filterAction;
        const userMatch = filterUser === 'ALL' || l.username === filterUser;
        return actionMatch && userMatch;
    });

    // Stats
    const stats = {
        total: logs.length,
        edits: logs.filter(l => l.actionType === 'EDIT').length,
        creates: logs.filter(l => l.actionType === 'CREATE').length,
        deletes: logs.filter(l => l.actionType === 'DELETE').length,
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col text-on-surface">
                {/* Toolbar */}
                <div className="bg-[#0a0a0a]/50 border border-[#222] rounded-xl mb-4 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 hidden sm:flex">
                        <span className="material-symbols-outlined text-primary text-[18px]">filter_list</span>
                        <h2 className="font-bold text-on-surface text-[14px]">Filter Activity</h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Room selector */}
                        <select
                            value={selectedRoomId}
                            onChange={e => { setPage(0); setSelectedRoomId(e.target.value); }}
                            className="bg-black/20 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-on-surface text-[11px] focus:border-primary/50 focus:outline-none"
                        >
                            {rooms.map(r => (
                                <option key={r.id} value={r.id} className="bg-surface-container">{r.name}</option>
                            ))}
                        </select>

                        {/* Action filter */}
                        <select
                            value={filterAction}
                            onChange={e => setFilterAction(e.target.value)}
                            className="bg-black/20 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-on-surface text-[11px] focus:border-primary/50 focus:outline-none"
                        >
                            {['ALL', 'EDIT', 'CREATE', 'DELETE', 'RENAME', 'JOIN', 'LEAVE'].map(a => (
                                <option key={a} value={a} className="bg-surface-container">{a}</option>
                            ))}
                        </select>

                        {/* User filter */}
                        <select
                            value={filterUser}
                            onChange={e => setFilterUser(e.target.value)}
                            className="bg-black/20 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-on-surface text-[11px] focus:border-primary/50 focus:outline-none"
                        >
                            {users.map(u => (
                                <option key={u} value={u} className="bg-surface-container">{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stats row */}
                <div className="flex gap-3 px-4 pt-4 flex-wrap shrink-0">
                    {[
                        { label: 'Total Events', value: stats.total, icon: 'history', color: 'text-primary' },
                        { label: 'Edits', value: stats.edits, icon: 'edit', color: 'text-blue-400' },
                        { label: 'Creates', value: stats.creates, icon: 'add_circle', color: 'text-green-400' },
                        { label: 'Deletes', value: stats.deletes, icon: 'delete', color: 'text-red-400' },
                    ].map(s => (
                        <div key={s.label} className="glass-card rounded-xl px-4 py-3 flex items-center gap-2 flex-1 min-w-[100px]">
                            <span className={`material-symbols-outlined text-[18px] ${s.color}`}>{s.icon}</span>
                            <div>
                                <p className="text-on-surface font-bold text-[14px]">{s.value}</p>
                                <p className="text-on-surface-variant text-[10px]">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Log list */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-2">
                    {isLoading ? (
                        [1,2,3,4].map(i => (
                            <div key={i} className="glass-card rounded-xl h-12 animate-pulse bg-surface-variant/20" />
                        ))  
                    ) : error ? (
                                <div className="flex flex-col items-center justify-center flex-1 gap-3">
                                    <span className="material-symbols-outlined text-[40px] text-error">error</span>
                                    <p className="text-error text-[12px]">{error}</p>
                                    <button
                                        onClick={() => setSelectedRoomId(selectedRoomId)}  
                                        className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-[11px] hover:bg-primary/20"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : filtered.length === 0 ? (
                                // ... empty state unchanged
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 opacity-50">
                            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">history</span>
                            <p className="text-on-surface-variant text-[12px]">No activity yet</p>
                        </div>
                    ) : (
                        filtered.map(entry => <LogRow key={entry.id} entry={entry} />)
                    )}


                    {/* Pagination */}
                    {totalPages > 1 && !isLoading && (
                        <div className="flex gap-2 justify-center pt-2">
                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-[11px] hover:bg-surface-variant/30 disabled:opacity-30 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">chevron_left</span>Previous
                            </button>
                            <span className="text-on-surface-variant text-[11px] self-center">
                                Page {page + 1} of {totalPages}
                            </span>
                            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-[11px] hover:bg-surface-variant/30 disabled:opacity-30 flex items-center gap-1">
                                Next<span className="material-symbols-outlined text-[14px]">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default ActivityLog;