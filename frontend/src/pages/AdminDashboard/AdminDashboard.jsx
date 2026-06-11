import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar
} from 'recharts';
import api from '../../api/axios';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For charts
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/admin/metrics');
        const data = response.data;
        
        setMetrics(data);
        
        // Add to history for charts (keeping last 20 data points)
        const time = new Date().toLocaleTimeString();
        setHistory(prev => {
          const newPoint = { 
            time, 
            memory: parseFloat(data.hostTotalMemoryGb.toFixed(2)),
            redisOps: data.redisOpsPerSec,
            activeWorkspaces: data.activeWorkspaces
          };
          const newHistory = [...prev, newPoint];
          if (newHistory.length > 20) newHistory.shift();
          return newHistory;
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admin metrics:', err);
        setError(err.response?.status === 403 ? 'Access Denied. Admin privileges required.' : 'Failed to fetch metrics.');
        setLoading(false);
      }
    };

    fetchMetrics();
    const intervalId = setInterval(fetchMetrics, 5000); // Polling every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !metrics) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-[32px] text-primary animate-spin">refresh</span>
          <p className="text-on-surface-variant font-label-md">Loading System Metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-md text-center max-w-md p-2xl bg-surface rounded-2xl border border-white/5">
          <span className="material-symbols-outlined text-[48px] text-error">lock</span>
          <h2 className="text-heading-md font-heading-md text-on-surface">{error}</h2>
          <p className="text-on-surface-variant font-body-md text-body-md">You do not have permission to view the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-2xl">
      <div className="max-w-[1200px] mx-auto space-y-2xl">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-lg font-heading-lg text-on-surface">System Telemetry</h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-xs">Real-time health and performance monitoring</p>
          </div>
          <div className="flex items-center gap-sm bg-surface-variant px-lg py-sm rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-label-sm font-label-sm text-on-surface">Systems Operational</span>
          </div>
        </div>

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl">
          <MetricCard 
            icon="group" 
            title="Total Users" 
            value={metrics.totalUsers} 
            color="text-primary"
            bg="bg-primary/10"
          />
          <MetricCard 
            icon="dns" 
            title="Active Workspaces" 
            value={`${metrics.activeWorkspaces} / ${metrics.totalWorkspaces}`} 
            color="text-success"
            bg="bg-success/10"
          />
          <MetricCard 
            icon="memory" 
            title="Host Memory Capacity" 
            value={`${metrics.hostTotalMemoryGb.toFixed(1)} GB`} 
            color="text-[#8b5cf6]"
            bg="bg-[#8b5cf6]/10"
          />
          <MetricCard 
            icon="hub" 
            title="Redis Connections" 
            value={metrics.redisConnectedClients} 
            color="text-[#ec4899]"
            bg="bg-[#ec4899]/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
          {/* Redis Ops Chart */}
          <div className="bg-[#161618] rounded-2xl p-xl border border-white/5">
            <div className="flex items-center gap-md mb-xl">
              <span className="material-symbols-outlined text-[#ec4899]">bolt</span>
              <h3 className="text-heading-sm font-heading-sm text-on-surface">Redis Pub/Sub Throughput</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#ffffff50" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e1e20', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#ec4899' }}
                  />
                  <Area type="monotone" dataKey="redisOps" name="Ops/sec" stroke="#ec4899" fillOpacity={1} fill="url(#colorOps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Docker Containers Chart */}
          <div className="bg-[#161618] rounded-2xl p-xl border border-white/5">
            <div className="flex items-center gap-md mb-xl">
              <span className="material-symbols-outlined text-[#3b82f6]">view_in_ar</span>
              <h3 className="text-heading-sm font-heading-sm text-on-surface">Active Docker Containers</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#ffffff50" fontSize={12} allowDecimals={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e1e20', border: '1px solid #ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#3b82f6' }}
                    cursor={{fill: '#ffffff05'}}
                  />
                  <Bar dataKey="activeWorkspaces" name="Running Workspaces" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="bg-[#161618] rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-xl border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-heading-sm font-heading-sm text-on-surface">Infrastructure Summary</h3>
          </div>
          <div className="divide-y divide-white/5">
            <StatRow label="Docker Host CPUs" value={`${metrics.hostTotalCpuCores} Cores`} />
            <StatRow label="Raw Containers Running" value={metrics.dockerContainersRunning} />
            <StatRow label="Redis Memory Utilized" value={`${(metrics.redisMemoryUsedBytes / 1024 / 1024).toFixed(2)} MB`} />
          </div>
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ icon, title, value, color, bg }) => (
  <div className="bg-[#161618] rounded-2xl p-xl border border-white/5 flex items-center gap-xl relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
      <span className="material-symbols-outlined text-[24px]">{icon}</span>
    </div>
    <div>
      <p className="text-label-sm font-label-sm text-on-surface-variant mb-xs">{title}</p>
      <h3 className="text-heading-lg font-heading-lg text-on-surface">{value}</h3>
    </div>
  </div>
);

const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between p-xl hover:bg-white/[0.02] transition-colors">
    <span className="text-body-md font-body-md text-on-surface-variant">{label}</span>
    <span className="text-label-md font-label-md text-on-surface">{value}</span>
  </div>
);

export default AdminDashboard;
