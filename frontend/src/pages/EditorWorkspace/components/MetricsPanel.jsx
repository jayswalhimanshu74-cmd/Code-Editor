import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';

const MetricsPanel = ({ roomId }) => {
    const [metrics, setMetrics] = useState({
        cpuPercentage: 0,
        memoryUsageMb: 0,
        memoryLimitMb: 512
    });

    useEffect(() => {
        if (!roomId) return;

        const fetchMetrics = async () => {
            try {
                const { data } = await api.get(`/metrics/${roomId}`);
                setMetrics({
                    cpuPercentage: data.cpuPercentage || 0,
                    memoryUsageMb: data.memoryUsageMb || 0,
                    memoryLimitMb: data.memoryLimitMb || 512
                });
            } catch (error) {
                console.error("Failed to fetch container metrics:", error);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 2000);

        return () => clearInterval(interval);
    }, [roomId]);

    const memPercent = Math.min(100, (metrics.memoryUsageMb / metrics.memoryLimitMb) * 100);
    const cpuPercent = Math.min(100, metrics.cpuPercentage);

    return (
        <div className="h-full flex flex-col bg-transparent text-white/90">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#0070f3]">monitoring</span>
                    <h3 className="font-label-md font-bold uppercase tracking-wider text-[11px] text-[#0070f3]">
                        Workspace Health
                    </h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                    <span className="text-[10px] text-white/50 font-mono">Live</span>
                </div>
            </div>

            {/* Metrics Body */}
            <div className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto">
                
                {/* CPU Metric */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-white/40">memory</span>
                            <span className="text-[12px] font-medium text-white/70">CPU Usage</span>
                        </div>
                        <span className="text-[13px] font-mono font-bold text-[#00f0ff]">
                            {cpuPercent.toFixed(1)}%
                        </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div 
                            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#0070f3] to-[#00f0ff]"
                            style={{ width: `${cpuPercent}%` }}
                        />
                    </div>
                </div>

                {/* Memory Metric */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-white/40">database</span>
                            <span className="text-[12px] font-medium text-white/70">Memory (RAM)</span>
                        </div>
                        <span className="text-[13px] font-mono font-bold text-[#0070f3]">
                            {metrics.memoryUsageMb.toFixed(1)} <span className="text-[10px] text-white/40 font-normal">/ {metrics.memoryLimitMb.toFixed(0)} MB</span>
                        </span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <div 
                            className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-[#0070f3] to-purple-500"
                            style={{ width: `${memPercent}%` }}
                        />
                    </div>
                </div>

                {/* Info Note */}
                <div className="mt-4 p-3 rounded-lg bg-[#0070f3]/5 border border-[#0070f3]/15 flex gap-2 items-start">
                    <span className="material-symbols-outlined text-[14px] text-[#0070f3] flex-shrink-0 mt-0.5">info</span>
                    <p className="text-[10px] text-white/50 leading-relaxed">
                        Metrics reflect the isolated Docker container running your code. Heavy processes (like infinite loops) will increase CPU usage rapidly.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default MetricsPanel;
