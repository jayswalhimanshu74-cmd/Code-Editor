import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useRoomStore from '../../store/roomStore';
import { executionService } from '../../api/executionService';

const LANGUAGE_LABELS = {
    javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
    java: 'Java', cpp: 'C++', c: 'C', go: 'Go',
    rust: 'Rust', kotlin: 'Kotlin', csharp: 'C#',
};

const languageColor = (lang) => {
    const map = {
        javascript: 'text-yellow-400 bg-yellow-400/10',
        typescript: 'text-blue-400 bg-blue-400/10',
        python: 'text-green-400 bg-green-400/10',
        java: 'text-orange-400 bg-orange-400/10',
        cpp: 'text-purple-400 bg-purple-400/10',
        c: 'text-purple-300 bg-purple-300/10',
        go: 'text-cyan-400 bg-cyan-400/10',
        rust: 'text-orange-300 bg-orange-300/10',
        kotlin: 'text-violet-400 bg-violet-400/10',
        csharp: 'text-green-300 bg-green-300/10',
    };
    return map[lang] || 'text-on-surface-variant bg-surface-variant/30';
};

const statusColor = (status) => {
    if (!status) return 'text-on-surface-variant bg-surface-variant/20';
    if (status === 'Accepted') return 'text-green-400 bg-green-400/10';
    if (status === 'Runtime Error') return 'text-red-400 bg-red-400/10';
    if (status === 'Compilation Error') return 'text-orange-400 bg-orange-400/10';
    if (status === 'Time Limit Exceeded') return 'text-yellow-400 bg-yellow-400/10';
    return 'text-on-surface-variant bg-surface-variant/20';
};

// ── Execution Card ─────────────────────────────────────────────────────────────
const ExecutionCard = ({ entry }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/20 hover:border-primary/20 transition-all">
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-variant/10 transition-colors"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-label-sm flex-shrink-0 ${languageColor(entry.language)}`}>
                        {LANGUAGE_LABELS[entry.language] || entry.language}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-label-sm flex-shrink-0 ${statusColor(entry.status)}`}>
                        {entry.status || 'Unknown'}
                    </span>
                    <span className="text-on-surface-variant text-[11px] font-code-md truncate hidden sm:block">
                        {entry.sourceCode?.split('\n')[0]?.slice(0, 60) || 'No preview'}
                    </span>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                    <span className="text-on-surface-variant text-[10px] hidden md:block">
                        {entry.durationMs ? `${entry.durationMs}ms` : '—'}
                    </span>
                    <span className="text-on-surface-variant text-[10px] hidden lg:block">
                        {entry.executedAt
                            ? new Date(entry.executedAt).toLocaleString()
                            : '—'}
                    </span>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant transition-transform" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        expand_more
                    </span>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-outline-variant/20 flex flex-col gap-0">
                    {/* Source code */}
                    <div className="px-4 py-3 bg-black/20">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-label-sm">Source Code</p>
                        <pre className="text-on-surface text-[11px] font-code-md whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                            {entry.sourceCode || '—'}
                        </pre>
                    </div>

                    {/* Output */}
                    {(entry.stdout || entry.stderr) && (
                        <div className="px-4 py-3 border-t border-outline-variant/10 bg-black/30">
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-2 font-label-sm">Output</p>
                            {entry.stdout && (
                                <pre className="text-green-400 text-[11px] font-code-md whitespace-pre-wrap leading-relaxed">
                                    {entry.stdout}
                                </pre>
                            )}
                            {entry.stderr && (
                                <pre className="text-red-400 text-[11px] font-code-md whitespace-pre-wrap leading-relaxed mt-1">
                                    {entry.stderr}
                                </pre>
                            )}
                        </div>
                    )}

                    {/* Meta */}
                    <div className="px-4 py-2 border-t border-outline-variant/10 flex items-center gap-4 flex-wrap">
                        <span className="text-[10px] text-on-surface-variant">
                            Exit code: <span className={entry.exitCode === 0 ? 'text-green-400' : 'text-red-400'}>{entry.exitCode ?? '—'}</span>
                        </span>
                        {entry.durationMs && (
                            <span className="text-[10px] text-on-surface-variant">
                                Duration: <span className="text-on-surface">{entry.durationMs}ms</span>
                            </span>
                        )}
                        {entry.runByUsername && (
                            <span className="text-[10px] text-on-surface-variant">
                                Run by: <span className="text-on-surface">{entry.runByUsername}</span>
                            </span>
                        )}
                        {entry.executedAt && (
                            <span className="text-[10px] text-on-surface-variant ml-auto">
                                {new Date(entry.executedAt).toLocaleString()}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ── History Page ───────────────────────────────────────────────────────────────
const History = () => {
    const { user, logout } = useAuthStore();
    const { rooms, fetchRooms } = useRoomStore();

    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');

    // Load rooms on mount
    useEffect(() => {
        fetchRooms();
    }, []);

    // Auto-select first room
    useEffect(() => {
        if (rooms.length > 0 && !selectedRoomId) {
            setSelectedRoomId(rooms[0].id);
        }
    }, [rooms]);

    // Fetch history when room changes
    useEffect(() => {
        if (!selectedRoomId) return;
        const load = async () => {
            setIsLoading(true);
            setError('');
            try {
                const { data } = await executionService.getHistory(selectedRoomId);
                setHistory(data);
            } catch (err) {
                setError('Failed to load history');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [selectedRoomId]);

    // Filter by language or status
    const filtered = history.filter((entry) => {
        if (!filter) return true;
        const q = filter.toLowerCase();
        return (
            entry.language?.toLowerCase().includes(q) ||
            entry.status?.toLowerCase().includes(q) ||
            entry.sourceCode?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex overflow-hidden h-screen bg-background text-on-surface">

            {/* Sidebar */}
            <aside className="hidden md:flex flex-col h-full py-md bg-surface-container-lowest/90 backdrop-blur-2xl border-r border-outline-variant/20 w-[220px] z-50 shrink-0">
                <div className="px-md mb-lg">
                    <h1 className="font-headline-md text-headline-md font-black text-primary">CodeEditor</h1>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{user?.username}</p>
                </div>
                <nav className="flex-1 space-y-1">
                    <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all" to="/dashboard">
                        <span className="material-symbols-outlined">folder_open</span>
                        <span className="font-label-sm text-label-sm">My Rooms</span>
                    </Link>
                    <Link className="flex items-center gap-sm bg-primary/10 text-primary border-r-2 border-primary px-md py-sm" to="/history">
                        <span className="material-symbols-outlined">history</span>
                        <span className="font-label-sm text-label-sm">History</span>
                    </Link>
                    <Link className="flex items-center gap-sm text-on-surface-variant hover:text-on-surface px-md py-sm hover:bg-white/5 transition-all" to="/settings">
                        <span className="material-symbols-outlined">settings</span>
                        <span className="font-label-sm text-label-sm">Settings</span>
                    </Link>
                </nav>
                <div className="mt-auto pt-md border-t border-outline-variant/20 px-md">
                    <button
                        onClick={async () => { await logout(); window.location.href = '/login'; }}
                        className="w-full text-on-surface-variant flex items-center gap-sm px-sm py-xs hover:bg-error/10 hover:text-error rounded transition-colors font-label-sm text-label-sm"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

                {/* Header */}
                <header className="bg-surface-container-low/80 backdrop-blur-xl border-b border-outline-variant/30 h-14 flex items-center justify-between px-md shrink-0 gap-3">
                    <h1 className="font-headline-md text-headline-md font-bold text-on-surface">Execution History</h1>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                        {/* Room selector */}
                        <select
                            value={selectedRoomId}
                            onChange={(e) => setSelectedRoomId(e.target.value)}
                            className="bg-black/20 border border-outline-variant/40 rounded-lg px-3 py-1.5 text-on-surface text-[11px] focus:border-primary/50 focus:outline-none transition-all max-w-[180px]"
                        >
                            {rooms.map((r) => (
                                <option key={r.id} value={r.id} className="bg-surface-container">
                                    {r.name}
                                </option>
                            ))}
                        </select>

                        {/* Search filter */}
                        <div className="flex items-center bg-black/20 border border-outline-variant/30 rounded-lg px-3 py-1.5 gap-2">
                            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">search</span>
                            <input
                                className="bg-transparent text-on-surface text-[11px] placeholder:text-outline focus:outline-none w-36"
                                placeholder="Filter by language..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-md flex flex-col gap-3">

                    {/* Stats row */}
                    {history.length > 0 && (
                        <div className="flex gap-3 flex-wrap mb-1">
                            {[
                                { label: 'Total Runs', value: history.length, icon: 'play_circle' },
                                { label: 'Accepted', value: history.filter(h => h.status === 'Accepted').length, icon: 'check_circle', color: 'text-green-400' },
                                { label: 'Errors', value: history.filter(h => h.status !== 'Accepted').length, icon: 'error', color: 'text-red-400' },
                                { label: 'Avg Time', value: history.length ? `${Math.round(history.reduce((a, b) => a + (b.durationMs || 0), 0) / history.length)}ms` : '—', icon: 'timer' },
                            ].map((stat) => (
                                <div key={stat.label} className="glass-card rounded-xl px-4 py-3 flex items-center gap-3 flex-1 min-w-[120px]">
                                    <span className={`material-symbols-outlined text-[20px] ${stat.color || 'text-primary'}`}>{stat.icon}</span>
                                    <div>
                                        <p className="text-on-surface font-bold text-[14px]">{stat.value}</p>
                                        <p className="text-on-surface-variant text-[10px]">{stat.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* States */}
                    {!selectedRoomId ? (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 opacity-50">
                            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">folder_open</span>
                            <p className="text-on-surface-variant text-[12px]">Select a room to view history</p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="glass-card rounded-xl h-14 animate-pulse bg-surface-variant/20" />
                            ))}
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3">
                            <span className="material-symbols-outlined text-[40px] text-error">error</span>
                            <p className="text-error text-[12px]">{error}</p>
                            <button
                                onClick={() => setSelectedRoomId(selectedRoomId)}
                                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-[11px] hover:bg-primary/20 transition-all"
                            >
                                Retry
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 gap-3 opacity-50">
                            <span className="material-symbols-outlined text-[40px] text-on-surface-variant">history</span>
                            <p className="text-on-surface-variant text-[12px]">
                                {filter ? 'No results match your filter' : 'No executions yet — run some code!'}
                            </p>
                        </div>
                    ) : (
                        filtered.map((entry, i) => (
                            <ExecutionCard key={entry.id || i} entry={entry} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default History;