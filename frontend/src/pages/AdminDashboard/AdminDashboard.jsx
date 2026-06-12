import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api/axios';

const MetricCard = ({ icon, title, value, color, bg, pulse }) => (
    <div className="relative rounded-2xl p-5 flex items-center gap-4 overflow-hidden group transition-all hover:scale-[1.02] duration-200"
        style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)', boxShadow: `0 0 20px ${color}08` }}>
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `radial-gradient(circle at top right, ${color}08, transparent 70%)` }} />
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl opacity-60"
            style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative"
            style={{ background: bg }}>
            <span className="material-symbols-outlined text-[24px]" style={{ color }}>{icon}</span>
            {pulse && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-background animate-pulse" />}
        </div>
        <div>
            <p className="text-[11px] text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">{title}</p>
            <h3 className="text-[24px] font-extrabold text-on-surface leading-none tracking-tight">{value}</h3>
        </div>
    </div>
);

const StatRow = ({ label, value, color }) => (
    <div className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/5 border-b last:border-0"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <span className="text-[12px] text-on-surface-variant">{label}</span>
        <span className="text-[12px] font-semibold" style={{ color: color || 'rgba(255,255,255,0.9)' }}>{value}</span>
    </div>
);

const chartStyle = {
    contentStyle: { backgroundColor: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
    labelStyle: { color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
};

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const { data } = await api.get('/admin/metrics');
                setMetrics(data);
                setLastUpdated(new Date());
                const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                setHistory(prev => {
                    const pt = { time, memory: parseFloat(data.hostTotalMemoryGb.toFixed(2)), redisOps: data.redisOpsPerSec, activeWorkspaces: data.activeWorkspaces };
                    const h = [...prev, pt]; if (h.length > 20) h.shift(); return h;
                });
                setLoading(false);
            } catch (err) {
                setError(err.response?.status === 403 ? 'Admin privileges required.' : 'Failed to fetch metrics.');
                setLoading(false);
            }
        };
        fetchMetrics();
        const id = setInterval(fetchMetrics, 5000);
        return () => clearInterval(id);
    }, []);

    if (loading && !metrics) return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
                    style={{ background: 'rgba(0,112,243,0.12)', border: '1px solid rgba(0,112,243,0.25)' }}>
                    <span className="material-symbols-outlined text-primary text-[32px] animate-spin">refresh</span>
                </div>
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Gathering live telemetry...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm p-8 rounded-3xl"
                style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', backdropFilter: 'blur(12px)' }}>
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.10)', boxShadow: '0 0 30px rgba(239,68,68,0.2)' }}>
                    <span className="material-symbols-outlined text-error text-[40px]">security</span>
                </div>
                <h2 className="text-[20px] font-black text-on-surface">Access Denied</h2>
                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</p>
            </div>
        </div>
    );

    const chartCard = (title, icon, color, children) => (
        <div className="rounded-2xl p-5 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] min-w-0"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                        <span className="material-symbols-outlined text-[18px]" style={{ color }}>{icon}</span>
                    </div>
                    <h3 className="text-[15px] font-bold text-on-surface tracking-tight">{title}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                    <span className="text-[9px] uppercase font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Live</span>
                </div>
            </div>
            {children}
        </div>
    );

    return (
        <div className="flex-1 w-full text-on-surface flex flex-col gap-5 pb-6">

            {/* Premium Header Banner */}
            <div className="relative rounded-2xl overflow-hidden p-6"
                style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.12) 0%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(0,112,243,0.22)', backdropFilter: 'blur(16px)' }}>
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, #0070f3, #c084fc, transparent)' }} />
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,112,243,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />
                
                <div className="flex items-center justify-between flex-wrap gap-4 relative">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(0,112,243,0.2), rgba(139,92,246,0.2))', border: '2px solid rgba(0,112,243,0.4)', boxShadow: '0 0 20px rgba(0,112,243,0.3)' }}>
                            <span className="material-symbols-outlined text-[28px] text-white">dashboard_customize</span>
                        </div>
                        <div>
                            <div className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" /> Live Telemetry
                            </div>
                            <h1 className="text-[26px] font-black tracking-tight text-white leading-none">System Dashboard</h1>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                            style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.30)', boxShadow: '0 0 16px rgba(52,211,153,0.2)' }}>
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[12px] font-bold text-green-400">All Systems Operational</span>
                        </div>
                        <p className="text-[11px] font-mono mr-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {lastUpdated ? `LAST PING: ${lastUpdated.toLocaleTimeString()}` : 'CONNECTING...'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon="group"    title="Total Users"       value={metrics.totalUsers}                                            color="#60a5fa" bg="rgba(96,165,250,0.12)"   pulse />
                <MetricCard icon="dns"      title="Active Workspaces" value={`${metrics.activeWorkspaces} / ${metrics.totalWorkspaces}`}    color="#4ade80" bg="rgba(74,222,128,0.12)"  />
                <MetricCard icon="memory"   title="Host Memory"       value={`${metrics.hostTotalMemoryGb.toFixed(1)} GB`}                  color="#c084fc" bg="rgba(192,132,252,0.12)" />
                <MetricCard icon="hub"      title="Redis Clients"     value={metrics.redisConnectedClients}                                 color="#f472b6" bg="rgba(244,114,182,0.12)" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {chartCard('Redis Pub/Sub Throughput', 'bolt', '#f472b6', (
                    <div className="h-[260px] w-full min-w-0 relative">
                        <ResponsiveContainer width="99%" height="100%">
                            <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gOps" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#f472b6" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} fontFamily="monospace" tickMargin={10} minTickGap={40} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontFamily="monospace" tickLine={false} axisLine={false} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                                <RechartsTooltip {...chartStyle} itemStyle={{ color: '#f472b6', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="redisOps" name="Ops/sec" stroke="#f472b6" strokeWidth={3} fillOpacity={1} fill="url(#gOps)" activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ))}

                {chartCard('Active Docker Containers', 'view_in_ar', '#60a5fa', (
                    <div className="h-[260px] w-full min-w-0 relative">
                        <ResponsiveContainer width="99%" height="100%">
                            <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%"   stopColor="#60a5fa" stopOpacity={1} />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" fontSize={10} fontFamily="monospace" tickMargin={10} minTickGap={40} tickLine={false} axisLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} fontFamily="monospace" allowDecimals={false} tickLine={false} axisLine={false} />
                                <RechartsTooltip {...chartStyle} itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                                <Bar dataKey="activeWorkspaces" name="Running Workspaces" fill="url(#gBar)" radius={[6,6,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>

            {/* Infrastructure summary */}
            <div className="rounded-2xl overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.3)' }}>
                        <span className="material-symbols-outlined text-[18px]" style={{ color: '#c084fc' }}>dns</span>
                    </div>
                    <div>
                        <h3 className="text-[14px] font-bold text-on-surface">Infrastructure Summary</h3>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Host resource allocation</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="p-5 flex flex-col gap-1 transition-colors hover:bg-white/5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Docker CPU Cores</span>
                        <span className="text-[20px] font-black" style={{ color: '#c084fc' }}>{metrics.hostTotalCpuCores}</span>
                    </div>
                    <div className="p-5 flex flex-col gap-1 transition-colors hover:bg-white/5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Raw Containers</span>
                        <span className="text-[20px] font-black" style={{ color: '#60a5fa' }}>{metrics.dockerContainersRunning}</span>
                    </div>
                    <div className="p-5 flex flex-col gap-1 transition-colors hover:bg-white/5">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Redis Memory</span>
                        <span className="text-[20px] font-black" style={{ color: '#f472b6' }}>{(metrics.redisMemoryUsedBytes / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
