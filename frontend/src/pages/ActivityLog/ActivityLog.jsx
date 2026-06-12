import React, { useEffect, useState } from 'react';
import useRoomStore from '../../store/roomStore';
import { logService } from '../../api/logService';
import { wsService } from '../../api/websocketService';

const ACTION_META = {
    EDIT:   { icon: 'edit',                      color: '#60a5fa',  bg: 'rgba(96,165,250,0.12)',   label: 'Edited'   },
    CREATE: { icon: 'add_circle',                color: '#4ade80',  bg: 'rgba(74,222,128,0.12)',   label: 'Created'  },
    DELETE: { icon: 'delete',                    color: '#f87171',  bg: 'rgba(248,113,113,0.12)',  label: 'Deleted'  },
    RENAME: { icon: 'drive_file_rename_outline', color: '#fbbf24',  bg: 'rgba(251,191,36,0.12)',   label: 'Renamed'  },
    JOIN:   { icon: 'login',                     color: '#34d399',  bg: 'rgba(52,211,153,0.12)',   label: 'Joined'   },
    LEAVE:  { icon: 'logout',                    color: '#fb923c',  bg: 'rgba(251,146,60,0.12)',   label: 'Left'     },
};

const parseDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) { const [y, m, day, h=0, min=0, s=0] = d; return new Date(y, m-1, day, h, min, s); }
    return new Date(d);
};

// ── Compact Log Row Component ──────────────────────────────────────────────
const LogRow = ({ entry, isActive, onClick, index }) => {
    const meta = ACTION_META[entry.actionType] || ACTION_META.EDIT;
    const date = parseDate(entry.changedAt);

    return (
        <div 
            onClick={onClick}
            className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200 p-3.5 flex items-center justify-between border select-none"
            style={{ 
                animationDelay: `${index * 30}ms`, 
                background: isActive ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)', 
                borderColor: isActive ? 'rgba(0,112,243,0.4)' : 'rgba(255,255,255,0.05)',
                boxShadow: isActive ? '0 0 16px rgba(0,112,243,0.15)' : 'none'
            }}
        >
            {/* Left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-all" style={{ background: meta.color, opacity: isActive ? 1 : 0.5 }} />

            <div className="flex items-center gap-3 min-w-0 pl-1">
                {/* Action badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0"
                     style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}>
                    <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                    {meta.label}
                </div>

                {/* File / Target */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] opacity-40">
                        {entry.fileName ? 'description' : 'folder'}
                    </span>
                    <span className="text-[12px] font-semibold text-white/70 group-hover:text-white truncate">
                        {entry.fileName || 'Workspace'}
                    </span>
                </div>
            </div>

            {/* Right details */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                {/* User Info */}
                <div className="flex items-center gap-1.5 flex-shrink-0 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                    <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-black"
                         style={{ background: 'rgba(0,112,243,0.15)', color: '#60a5fa', border: '1px solid rgba(0,112,243,0.25)', width: 18, height: 18 }}>
                        {entry.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-[10px] font-bold text-white/60 hidden sm:block">{entry.username}</span>
                </div>

                {/* Date */}
                <span className="text-[10px] text-white/30 hidden lg:block">
                    {date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
                <span className="material-symbols-outlined text-[16px] text-white/20 group-hover:text-white/50 transition-colors">
                    chevron_right
                </span>
            </div>
        </div>
    );
};

// ── Log Detail Pane ──────────────────────────────────────────────────────────
const LogDetailPane = ({ entry }) => {
    if (!entry) return (
        <div className="h-full rounded-2xl flex flex-col items-center justify-center gap-3 opacity-40 p-6 border border-white/5 bg-white/[0.01]">
            <span className="material-symbols-outlined text-[36px]">event_note</span>
            <p className="text-[12px]">Select an event to view log details</p>
        </div>
    );

    const meta = ACTION_META[entry.actionType] || ACTION_META.EDIT;
    const date = parseDate(entry.changedAt);

    return (
        <div className="h-full rounded-2xl border flex flex-col overflow-hidden bg-white/[0.01]" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            
            {/* Header info */}
            <div className="p-4 border-b flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: meta.color }}>{meta.icon}</span>
                        <h2 className="text-[14px] font-bold text-white tracking-tight">Event Detail</h2>
                    </div>
                    <span className="text-[11px] text-white/40">{date ? date.toLocaleString() : '—'}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}>
                        {meta.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 text-white/70 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        {entry.username}
                    </span>
                </div>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                
                {/* Event overview */}
                <div className="rounded-xl p-4 border border-white/5 flex flex-col gap-2.5" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <div className="flex justify-between items-center text-[12px] py-1 border-b border-white/5">
                        <span className="text-white/40">Action Type</span>
                        <span className="font-bold text-white">{entry.actionType}</span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] py-1 border-b border-white/5">
                        <span className="text-white/40">Target File / Entity</span>
                        <span className="font-bold font-mono text-white flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">description</span>
                            {entry.fileName || 'Workspace Root'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-[12px] py-1">
                        <span className="text-white/40">Timestamp</span>
                        <span className="font-semibold text-white">{date ? date.toLocaleString() : '—'}</span>
                    </div>
                </div>

                {/* Code Snapshot (only for EDITS/CREATES where snapshot exists) */}
                {entry.contentSnapshot ? (
                    <div>
                        <p className="text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5 text-white/40">
                            <span className="material-symbols-outlined text-[13px]">history_edu</span>
                            Content Snapshot
                        </p>
                        <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar p-3.5 rounded-xl border border-white/5"
                             style={{ background: 'rgba(0,0,0,0.25)', color: '#e8e8f0' }}>
                            {entry.contentSnapshot}
                        </pre>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 opacity-30 text-center border border-dashed border-white/10 rounded-xl">
                        <span className="material-symbols-outlined text-[24px]">visibility_off</span>
                        <p className="text-[11px]">No snapshot recorded for this action type</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Activity Log Page ────────────────────────────────────────────────────────
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
    const [selectedEntry, setSelectedEntry] = useState(null);

    useEffect(() => { fetchRooms(); }, []);
    useEffect(() => { if (rooms.length > 0 && !selectedRoomId) setSelectedRoomId(rooms[0].id); }, [rooms]);

    useEffect(() => {
        if (!wsService.isConnected()) wsService.connect(() => {}, () => {});
    }, []);

    useEffect(() => {
        if (!selectedRoomId) return;
        setIsLoading(true); setError('');
        logService.getRoomLogs(selectedRoomId, page, 50)
            .then(({ data }) => { 
                const content = data.content ?? [];
                setLogs(content); 
                setTotalPages(data.totalPages ?? 0); 
                
                // Auto-select first item
                if (content.length > 0) {
                    setSelectedEntry(content[0]);
                } else {
                    setSelectedEntry(null);
                }
            })
            .catch(() => setError('Failed to load activity log'))
            .finally(() => setIsLoading(false));

        if (wsService.isConnected()) {
            const unsub = wsService.subscribe(`/topic/room/${selectedRoomId}/activity`, (newLog) => {
                setLogs(prev => {
                    const isDuplicate = prev.some(l => l.id === newLog.id);
                    if (isDuplicate) return prev;
                    const updated = [newLog, ...prev];
                    // If nothing was selected before, auto-select the incoming live event
                    if (!selectedEntry) setSelectedEntry(newLog);
                    return updated;
                });
            });
            return () => unsub?.();
        }
    }, [selectedRoomId, page]);

    const users = ['ALL', ...new Set(logs.map(l => l.username))];
    const filtered = logs.filter(l => {
        const actionMatch = filterAction === 'ALL' || l.actionType === filterAction;
        const userMatch = filterUser === 'ALL' || l.username === filterUser;
        return actionMatch && userMatch;
    });

    const stats = {
        total: logs.length,
        edits: logs.filter(l => l.actionType === 'EDIT').length,
        creates: logs.filter(l => l.actionType === 'CREATE').length,
        deletes: logs.filter(l => l.actionType === 'DELETE').length,
    };

    return (
        <div className="flex-1 w-full h-full flex flex-col text-on-surface gap-4 overflow-hidden">

            {/* Header & Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl shrink-0"
                 style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
                
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,112,243,0.12)', border: '1px solid rgba(0,112,243,0.25)' }}>
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#60a5fa' }}>history</span>
                    </div>
                    <div>
                        <h1 className="text-[16px] font-bold tracking-tight text-on-surface">Workspace Activity</h1>
                            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Real-time event logging</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <select value={selectedRoomId} onChange={e => { setPage(0); setSelectedRoomId(e.target.value); }}
                            className="px-3 py-2 rounded-xl text-[12px] font-semibold outline-none transition-all cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}>
                        {rooms.map(r => <option key={r.id} value={r.id} style={{ background: '#1a1a2e' }}>{r.name}</option>)}
                    </select>

                    <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
                            className="px-3 py-2 rounded-xl text-[12px] font-semibold outline-none transition-all cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}>
                        {['ALL', 'EDIT', 'CREATE', 'DELETE', 'RENAME', 'JOIN', 'LEAVE'].map(a =>
                            <option key={a} value={a} style={{ background: '#1a1a2e' }}>{a === 'ALL' ? 'All Actions' : a}</option>)}
                    </select>

                    <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
                            className="px-3 py-2 rounded-xl text-[12px] font-semibold outline-none transition-all cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}>
                        {users.map(u => <option key={u} value={u} style={{ background: '#1a1a2e' }}>{u === 'ALL' ? 'All Users' : u}</option>)}
                    </select>
                </div>
            </div>

            {/* Stats */}
            {logs.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                    {[
                        { label: 'Total Events', value: stats.total,   icon: 'list_alt',   color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
                        { label: 'Edits',        value: stats.edits,   icon: 'edit',       color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
                        { label: 'Creates',      value: stats.creates, icon: 'add_circle', color: '#4ade80', bg: 'rgba(74,222,128,0.10)' },
                        { label: 'Deletes',      value: stats.deletes, icon: 'delete',     color: '#f87171', bg: 'rgba(248,113,113,0.10)' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl p-3 flex items-center gap-3 transition-all hover:scale-[1.02]"
                             style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                                <span className="material-symbols-outlined text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                            </div>
                            <div>
                                <p className="text-[15px] font-black leading-none">{s.value}</p>
                                <p className="text-[9px] uppercase tracking-wider mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Content Layout (Split-pane) */}
            <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Left pane: compact list */}
                <div className="md:col-span-5 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1">
                        {!selectedRoomId ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-4 opacity-50 py-12">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <span className="material-symbols-outlined text-[32px]">folder_open</span>
                                </div>
                                <p className="text-[13px]">Select a workspace to view its activity log</p>
                            </div>
                        ) : isLoading ? (
                            [1,2,3,4,5].map(i => (
                                <div key={i} className="rounded-xl h-12 animate-pulse" style={{ background: 'rgba(255,255,255,0.03)', animationDelay: `${i*80}ms` }} />
                            ))
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-4 py-12">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <span className="material-symbols-outlined text-error text-[32px]">error</span>
                                </div>
                                <p className="text-error text-[13px]">{error}</p>
                                <button onClick={() => setSelectedRoomId(selectedRoomId)} className="px-5 py-2.5 rounded-xl text-[12px] font-bold text-white transition-all hover:scale-105"
                                        style={{ background: 'linear-gradient(135deg,#0070f3,#0050c8)', boxShadow: '0 0 16px rgba(0,112,243,0.3)' }}>Retry</button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center flex-1 gap-4 opacity-50 py-12">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                    <span className="material-symbols-outlined text-[32px]">history_toggle_off</span>
                                </div>
                                <p className="text-[13px]">No activity recorded for this workspace yet.</p>
                            </div>
                        ) : (
                            filtered.map((entry, i) => (
                                <LogRow 
                                    key={entry.id} 
                                    entry={entry} 
                                    index={i} 
                                    isActive={selectedEntry?.id === entry.id}
                                    onClick={() => setSelectedEntry(entry)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Right pane: details */}
                <div className="md:col-span-7 flex flex-col min-h-0">
                    <LogDetailPane entry={selectedEntry} />
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isLoading && !error && selectedRoomId && (
                <div className="flex gap-2 justify-center py-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {[
                        { label: 'Previous', icon: 'chevron_left', disabled: page === 0, onClick: () => setPage(p => p - 1) },
                        { label: 'Next', icon: 'chevron_right', disabled: page >= totalPages - 1, onClick: () => setPage(p => p + 1) },
                    ].map(btn => (
                        <button key={btn.label} disabled={btn.disabled} onClick={btn.onClick}
                            className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 flex items-center gap-1.5"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {btn.label === 'Previous' && <span className="material-symbols-outlined text-[16px]">{btn.icon}</span>}
                            {btn.label}
                            {btn.label === 'Next' && <span className="material-symbols-outlined text-[16px]">{btn.icon}</span>}
                        </button>
                    ))}
                    <span className="text-[11px] self-center px-3 font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Page {page+1} of {totalPages}</span>
                </div>
            )}
        </div>
    );
};

export default ActivityLog;