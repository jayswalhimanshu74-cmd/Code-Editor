package com.exaple.codeEditer.Code.Editor.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

@Component
public class ObservabilityMetrics {

    private final MeterRegistry registry;
    private final Counter executionCounter;
    private final Counter executionFailureCounter;
    private final Timer executionTimer;
    private final Counter wsConnectCounter;
    private final Counter wsDisconnectCounter;

    public ObservabilityMetrics(MeterRegistry registry) {
        this.registry = registry;
        this.executionCounter = Counter.builder("hencecode.code.execution.total")
                .description("Total code executions requested")
                .register(registry);
        this.executionFailureCounter = Counter.builder("hencecode.code.execution.failures")
                .description("Total code execution failures")
                .register(registry);
        this.executionTimer = Timer.builder("hencecode.code.execution.time")
                .description("Duration of code executions")
                .register(registry);
        this.wsConnectCounter = Counter.builder("hencecode.websocket.connections.total")
                .description("Total WebSocket client connections")
                .register(registry);
        this.wsDisconnectCounter = Counter.builder("hencecode.websocket.disconnections.total")
                .description("Total WebSocket client disconnections")
                .register(registry);
    }

    public void incrementCodeExecutions() {
        executionCounter.increment();
    }

    public void incrementCodeExecutionFailures() {
        executionFailureCounter.increment();
    }

    public Timer getExecutionTimer() {
        return executionTimer;
    }

    public void incrementWsConnections() {
        wsConnectCounter.increment();
    }

    public void incrementWsDisconnections() {
        wsDisconnectCounter.increment();
    }
}
