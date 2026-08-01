package com.exaple.codeEditer.Code.Editor.service;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class BusinessMetricsService {

    private final Counter codeExecutionTotal;
    private final Counter codeExecutionFailures;
    private final Timer codeExecutionTimer;
    private final AtomicInteger activeWorkspacesGauge;
    private final AtomicInteger activeTerminalSessionsGauge;

    public BusinessMetricsService(MeterRegistry registry) {
        this.codeExecutionTotal = Counter.builder("hencecode.code.execution.total")
                .description("Total number of code execution requests")
                .register(registry);

        this.codeExecutionFailures = Counter.builder("hencecode.code.execution.failures")
                .description("Total number of failed code executions")
                .register(registry);

        this.codeExecutionTimer = Timer.builder("hencecode.code.execution.time")
                .description("Latency distribution of code execution requests")
                .register(registry);

        this.activeWorkspacesGauge = registry.gauge("hencecode.workspace.active", new AtomicInteger(0));
        this.activeTerminalSessionsGauge = registry.gauge("hencecode.websocket.terminal.active", new AtomicInteger(0));
    }

    public void incrementExecutionTotal() {
        codeExecutionTotal.increment();
    }

    public void incrementExecutionFailures() {
        codeExecutionFailures.increment();
    }

    public void recordExecutionTime(long durationMs) {
        codeExecutionTimer.record(durationMs, TimeUnit.MILLISECONDS);
    }

    public void setActiveWorkspaces(int count) {
        activeWorkspacesGauge.set(count);
    }

    public void incrementTerminalSessions() {
        activeTerminalSessionsGauge.incrementAndGet();
    }

    public void decrementTerminalSessions() {
        if (activeTerminalSessionsGauge.get() > 0) {
            activeTerminalSessionsGauge.decrementAndGet();
        }
    }
}
