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
                log.error("Invalid REDIS_URL configuration string: {}", redisUrl, e);
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

        try (RedisConnection connection = connectionFactory.getConnection()) {
            String pingResult = connection.ping();
            log.info("\n" +
                    "========================================================================\n" +
                    " Redis Configuration & Health Check\n" +
                    "========================================================================\n" +
                    " Redis Host:        {}:{}\n" +
                    " SSL/TLS Enabled:   {}\n" +
                    " Provider:          {}\n" +
                    " Connection Status: {} (CONNECTED)\n" +
                    "========================================================================",
                    host, port, isSsl, provider, pingResult);
        } catch (Exception e) {
            log.error("\n" +
                    "========================================================================\n" +
                    " FATAL: REDIS CONNECTION FAILED!\n" +
                    "========================================================================\n" +
                    " Host:        {}:{}\n" +
                    " SSL Enabled: {}\n" +
                    " Provider:    {}\n" +
                    " Error:       {}\n" +
                    "========================================================================",
                    host, port, isSsl, provider, e.getMessage());

            throw new IllegalStateException(
                    String.format("Unable to connect to Redis [%s:%d, SSL=%b, Provider=%s]: %s",
                            host, port, isSsl, provider, e.getMessage()), e);
        }
    }
}
