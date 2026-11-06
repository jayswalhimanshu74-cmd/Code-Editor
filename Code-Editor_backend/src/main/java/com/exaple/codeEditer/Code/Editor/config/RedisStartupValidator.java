package com.exaple.codeEditer.Code.Editor.config;

import io.lettuce.core.RedisURI;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.stereotype.Component;

@Component
public class RedisStartupValidator {

    private static final Logger log = LoggerFactory.getLogger(RedisStartupValidator.class);

    private final RedisConnectionFactory connectionFactory;

    @Value("${spring.data.redis.enabled:true}")
    private boolean redisEnabled;

    @Value("${spring.data.redis.url:}")
    private String redisUrl;

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.ssl.enabled:false}")
    private boolean sslEnabled;

    public RedisStartupValidator(RedisConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void validateRedisConnection() {
        if (!redisEnabled) {
            log.info("Redis is disabled (spring.data.redis.enabled=false). Skipping startup connection check.");
            return;
        }

        String host = redisHost;
        int port = redisPort;
        boolean isSsl = sslEnabled;

        if (redisUrl != null && !redisUrl.isBlank()) {
            try {
                RedisURI uri = RedisURI.create(redisUrl.trim());
                host = uri.getHost();
                port = uri.getPort();
                isSsl = uri.isSsl() || (host != null && host.contains("upstash.io")) || sslEnabled;
            } catch (Exception e) {
                log.error("Invalid Redis URL configuration. Check the URL format and credentials.", e);
                throw new IllegalStateException("Invalid REDIS_URL format: " + redisUrl, e);
            }
        } else {
            isSsl = (host != null && host.contains("upstash.io")) || sslEnabled;
        }

        String provider;
        if (host != null && host.contains("upstash.io")) {
            provider = "Upstash Redis Cloud";
        } else if ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equalsIgnoreCase(host)) {
            provider = "Localhost Redis";
        } else {
            provider = "Remote Redis Server";
        }

        int maxAttempts = 5;
        long retryDelayMs = 3000;
        boolean connected = false;
        String pingResult = null;
        String lastError = null;

        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try (RedisConnection connection = connectionFactory.getConnection()) {
                pingResult = connection.ping();
                connected = true;
                log.info("\n" +
                        "========================================================================\n" +
                        " Redis Configuration & Health Check\n" +
                        "========================================================================\n" +
                        " Redis Host:        {}:{}\n" +
                        " SSL/TLS Enabled:   {}\n" +
                        " Provider:          {}\n" +
                        " Connection Status: {} (CONNECTED, attempt {}/{})\n" +
                        "========================================================================",
                        host, port, isSsl, provider, pingResult, attempt, maxAttempts);
                break;
            } catch (Exception e) {
                lastError = e.getMessage();
                log.warn("Redis startup connection attempt {}/{} failed for [{}:{}]: {}",
                        attempt, maxAttempts, host, port, e.getMessage());
                if (attempt < maxAttempts) {
                    try {
                        Thread.sleep(retryDelayMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.warn("Redis startup retry interrupted.");
                        break;
                    }
                }
            }
        }

        if (!connected) {
            log.warn("\n" +
                    "========================================================================\n" +
                    " WARNING: REDIS CONNECTION NOT READY AT STARTUP\n" +
                    "========================================================================\n" +
                    " Host:        {}:{}\n" +
                    " SSL Enabled: {}\n" +
                    " Provider:    {}\n" +
                    " Last Error:  {}\n" +
                    " Application will proceed to start. Redis features will reconnect.\n" +
                    "========================================================================",
                    host, port, isSsl, provider, lastError);
        }
    }
}
