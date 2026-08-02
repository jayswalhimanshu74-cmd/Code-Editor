package com.exaple.codeEditer.Code.Editor.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TracingFilter extends OncePerRequestFilter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String TRACE_ID_HEADER = "X-Trace-ID";
    private static final String SPAN_ID_HEADER = "X-Span-ID";
    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    private static final String CORRELATION_ID_MDC = "correlationId";
    private static final String TRACE_ID_MDC = "traceId";
    private static final String SPAN_ID_MDC = "spanId";
    private static final String REQUEST_ID_MDC = "requestId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String correlationId = request.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "");
        }

        String spanId = UUID.randomUUID().toString().substring(0, 16).replace("-", "");
        String requestId = UUID.randomUUID().toString().substring(0, 8);

        MDC.put(CORRELATION_ID_MDC, correlationId);
        MDC.put(TRACE_ID_MDC, traceId);
        MDC.put(SPAN_ID_MDC, spanId);
        MDC.put(REQUEST_ID_MDC, requestId);

        response.setHeader(CORRELATION_ID_HEADER, correlationId);
        response.setHeader(TRACE_ID_HEADER, traceId);
        response.setHeader(SPAN_ID_HEADER, spanId);
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(CORRELATION_ID_MDC);
            MDC.remove(TRACE_ID_MDC);
            MDC.remove(SPAN_ID_MDC);
            MDC.remove(REQUEST_ID_MDC);
        }
    }
}
