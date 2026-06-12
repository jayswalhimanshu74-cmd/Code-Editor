import React, { useEffect, useState } from 'react';
import useRoomStore from '../../store/roomStore';
import { executionService } from '../../api/executionService';

const LANGUAGE_META = {
    javascript: { color: '#f7df1e', bg: 'rgba(247,223,30,0.10)',  label: 'JavaScript' },
    typescript: { color: '#3178c6', bg: 'rgba(49,120,198,0.12)',  label: 'TypeScript' },
    python:     { color: '#4ade80', bg: 'rgba(74,222,128,0.10)',  label: 'Python'     },
    java:       { color: '#fb923c', bg: 'rgba(251,146,60,0.10)',  label: 'Java'       },
    cpp:        { color: '#c084fc', bg: 'rgba(192,132,252,0.10)', label: 'C++'        },
    c:          { color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', label: 'C'          },
    go:         { color: '#22d3ee', bg: 'rgba(34,211,238,0.10)',  label: 'Go'         },
    rust:       { color: '#f97316', bg: 'rgba(249,115,22,0.10)',  label: 'Rust'       },
    kotlin:     { color: '#818cf8', bg: 'rgba(129,140,248,0.10)', label: 'Kotlin'     },
    csharp:     { color: '#86efac', bg: 'rgba(134,239,172,0.10)', label: 'C#'         },
};

const STATUS_META = {
    'Accepted':            { icon: 'check_circle', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    'Runtime Error':       { icon: 'error',        color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    'Compilation Error':   { icon: 'build_circle', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
    'Time Limit Exceeded': { icon: 'timer',        color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    'default':             { icon: 'help',         color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
};

const parseDate = (d) => {
    if (!d) return null;
    if (Array.isArray(d)) { const [y, m, day, h=0, min=0, s=0] = d; return new Date(y, m-1, day, h, min, s); }
    return new Date(d);
};

// ── Compact Execution Row ──────────────────────────────────────────────────
const ExecutionRow = ({ entry, isActive, onClick, index }) => {
    const langMeta = LANGUAGE_META[entry.language] || { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', label: entry.language };
    const statMeta = STATUS_META[entry.status] || STATUS_META.default;
    const date = parseDate(entry.executedAt);

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
            {/* Left accent color indicator */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-all" style={{ background: statMeta.color, opacity: isActive ? 1 : 0.5 }} />

            <div className="flex items-center gap-3 min-w-0 pl-1">
                {/* Status icon */}
                <span className="material-symbols-outlined text-[16px] flex-shrink-0" style={{ color: statMeta.color }}>{statMeta.icon}</span>

                {/* Language Badge */}
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold flex-shrink-0"
                      style={{ background: langMeta.bg, color: langMeta.color, border: `1px solid ${langMeta.color}20` }}>
                    {langMeta.label}
                </span>

                {/* Status Badge */}
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold flex-shrink-0"
                      style={{ background: statMeta.bg, color: statMeta.color, border: `1px solid ${statMeta.color}20` }}>
                    {entry.status || 'Unknown'}
                </span>

                {/* Source Code Snippet */}
                <span className="text-[11px] font-mono truncate hidden sm:block text-white/50 group-hover:text-white/80 transition-colors">
                    {entry.sourceCode?.split('\n')[0]?.trim().slice(0, 40) || '/* No code preview */'}
                </span>
            </div>

            {/* Time / Duration */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                {entry.durationMs && (
                    <span className="text-[10px] font-mono text-white/40">{entry.durationMs}ms</span>
                )}
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

// ── Detail Pane ─────────────────────────────────────────────────────────────
const DetailPane = ({ entry }) => {
    if (!entry) return (
        <div className="h-full rounded-2xl flex flex-col items-center justify-center gap-3 opacity-40 p-6 border border-white/5 bg-white/[0.01]">
            <span className="material-symbols-outlined text-[36px]">code_blocks</span>
            <p className="text-[12px]">Select an execution run to view details</p>
        </div>
    );

    const langMeta = LANGUAGE_META[entry.language] || { color: '#60a5fa', bg: 'rgba(96,165,250,0.10)', label: entry.language };
    const statMeta = STATUS_META[entry.status] || STATUS_META.default;
    const date = parseDate(entry.executedAt);

    const copyCode = () => {
        navigator.clipboard.writeText(entry.sourceCode || '');
    };

    return (
        <div className="h-full rounded-2xl border flex flex-col overflow-hidden bg-white/[0.01]" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            
            {/* Header info */}
            <div className="p-4 border-b flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]" style={{ color: statMeta.color }}>{statMeta.icon}</span>
                        <h2 className="text-[14px] font-bold text-white tracking-tight">Run Details</h2>
                    </div>
                    <span className="text-[11px] text-white/40">{date ? date.toLocaleString() : '—'}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: langMeta.bg, color: langMeta.color, border: `1px solid ${langMeta.color}30` }}>
                        {langMeta.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: statMeta.bg, color: statMeta.color, border: `1px solid ${statMeta.color}30` }}>
                        {entry.status || 'Unknown'}
                    </span>
                    {entry.durationMs && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-white/60">
                            {entry.durationMs}ms
                        </span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-white/60">
                        Exit: <span style={{ color: entry.exitCode === 0 ? '#4ade80' : '#f87171' }}>{entry.exitCode ?? '—'}</span>
                    </span>
                </div>
            </div>

            {/* Content areas (Scrollable container) */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
                
                {/* Code block */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5" style={{ color: langMeta.color }}>
                            <span className="material-symbols-outlined text-[13px]">code</span>
                            Source Code
                        </p>
                        <button onClick={copyCode} className="text-[10px] font-bold text-white/40 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-all">
                            <span className="material-symbols-outlined text-[12px]">content_copy</span>
                            Copy
                        </button>
                    </div>
                    <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar p-3.5 rounded-xl border border-white/5"
                         style={{ background: 'rgba(0,0,0,0.25)', color: '#e8e8f0' }}>
                        {entry.sourceCode || '—'}
                    </pre>
                </div>

                {/* Console output */}
                {(entry.stdout || entry.stderr) ? (
                    <div>
                        <p className="text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5 text-white/40">
                            <span className="material-symbols-outlined text-[13px]">terminal</span>
                            Console Output
                        </p>
                        <div className="rounded-xl overflow-hidden border border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                            {entry.stdout && (
                                <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed p-3.5" style={{ color: '#4ade80', background: 'rgba(74,222,128,0.02)' }}>
                                    {entry.stdout}
                                </pre>
                            )}
                            {entry.stderr && (
                                <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed p-3.5 border-t border-white/5" style={{ color: '#f87171', background: 'rgba(248,113,113,0.02)' }}>
                                    {entry.stderr}
                                </pre>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-[10px] uppercase tracking-widest mb-2 font-bold flex items-center gap-1.5 text-white/40">
                            <span className="material-symbols-outlined text-[13px]">terminal</span>
                            Console Output
                        </p>
                        <div className="rounded-xl p-4 border border-white/5 text-[11px] font-mono text-white/30 italic text-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                            No stdout or stderr returned
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {entry.runByUsername && (
                <div className="px-4 py-3 border-t flex items-center justify-between bg-white/[0.005]" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">person</span>
                        Run by <span className="font-bold text-white/80">{entry.runByUsername}</span>
                    </span>
                </div>
            )}
        </div>
    );
};

// ── History Page ───────────────────────────────────────────────────────────────
const History = () => {
    const { rooms, fetchRooms } = useRoomStore();
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [selectedEntry, setSelectedEntry] = useState(null);

    useEffect(() => { fetchRooms(); }, []);
    useEffect(() => { if (rooms.length > 0 && !selectedRoomId) setSelectedRoomId(rooms[0].id); }, [rooms]);

    useEffect(() => {
        if (!selectedRoomId) return;
        const load = async () => {
            setIsLoading(true); setError('');
            try {
                const { data } = await executionService.getHistory(selectedRoomId, page, 20);
                const content = data.content ?? [];
                setHistory(content); 
                setTotalPages(data.totalPages ?? 0); 
                setTotalElements(data.totalElements ?? 0);
                
                // Auto-select first item if exists
                if (content.length > 0) {
                    setSelectedEntry(content[0]);
                } else {
                    setSelectedEntry(null);
                }
            } catch (err) { setError('Failed to load history'); }
            finally { setIsLoading(false); }
        };
        load();
    }, [selectedRoomId, page]);

    const filtered = history
        .filter(entry => {
            if (!filter) return true;
            const q = filter.toLowerCase();
            return (entry.language?.toLowerCase().includes(q) || entry.status?.toLowerCase().includes(q) || entry.sourceCode?.toLowerCase().includes(q));
        })
        .sort((a, b) => {
            const dA = parseDate(a.executedAt);
            const dB = parseDate(b.executedAt);
            if (!dA && !dB) return 0;
            if (!dA) return 1;
            if (!dB) return -1;
            return dB - dA;
        });

    const successCount = history.filter(h => h.status === 'Accepted').length;
    const errorCount = history.filter(h => h.status && h.status !== 'Accepted').length;
    const avgTime = history.length ? Math.round(history.reduce((a, b) => a + (b.durationMs || 0), 0) / history.length) : 0;

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
                        <h1 className="text-[16px] font-bold tracking-tight text-on-surface">Execution History</h1>
                        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Past code runs and outputs</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <select value={selectedRoomId} onChange={(e) => { setSelectedRoomId(e.target.value); setPage(0); }}
                            className="px-3 py-2 rounded-xl text-[12px] font-semibold outline-none transition-all cursor-pointer"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}>
                        {rooms.map(r => <option key={r.id} value={r.id} style={{ background: '#1a1a2e' }}>{r.name}</option>)}
                    </select>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="material-symbols-outlined text-[16px]" style={{ color: 'rgba(255,255,255,0.3)' }}>search</span>
                        <input className="bg-transparent text-[12px] outline-none w-32 placeholder:text-white/30 text-white"
                               placeholder="Filter language..." value={filter} onChange={e => setFilter(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            {history.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                    {[
                        { label: 'Total Runs', value: totalElements, icon: 'play_circle', color: '#60a5fa', bg: 'rgba(96,165,250,0.10)' },
                        { label: 'Accepted',   value: successCount,  icon: 'check_circle',color: '#4ade80', bg: 'rgba(74,222,128,0.10)' },
                        { label: 'Errors',     value: errorCount,    icon: 'error',       color: '#f87171', bg: 'rgba(248,113,113,0.10)' },
                        { label: 'Avg Time',   value: `${avgTime}ms`,icon: 'timer',       color: '#fbbf24', bg: 'rgba(251,191,36,0.10)' },
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
                                <p className="text-[13px]">Select a workspace to view its execution history</p>
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
                                <p className="text-[13px]">{filter ? 'No results match your filter' : 'No executions recorded yet. Run some code!'}</p>
                            </div>
                        ) : (
                            filtered.map((entry, i) => (
                                <ExecutionRow 
                                    key={entry.id || i} 
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
                    <DetailPane entry={selectedEntry} />
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && !isLoading && !error && selectedRoomId && (
                <div className="flex gap-2 justify-center py-3 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
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

export default History;