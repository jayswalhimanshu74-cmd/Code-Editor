package com.exaple.codeEditer.Code.Editor.config;

import com.exaple.codeEditer.Code.Editor.service.RedisSubscriber;
import io.lettuce.core.ClientOptions;
import io.lettuce.core.RedisURI;
import io.lettuce.core.SocketOptions;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.Duration;
import java.util.concurrent.Executor;

@Configuration
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    private final String TOPIC = "stomp-broker-relay";

    @Value("${spring.data.redis.url:}")
    private String redisUrl;

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.data.redis.ssl.enabled:false}")
    private boolean sslEnabled;

    @Value("${spring.data.redis.timeout:3000ms}")
    private Duration commandTimeout;

    @Value("${spring.data.redis.connect-timeout:3000ms}")
    private Duration connectTimeout;

    @Value("${spring.data.redis.lettuce.pool.max-active:16}")
    private int maxActive;

    @Value("${spring.data.redis.lettuce.pool.max-idle:8}")
    private int maxIdle;

    @Value("${spring.data.redis.lettuce.pool.min-idle:2}")
    private int minIdle;

    @Value("${spring.data.redis.lettuce.pool.max-wait:2000ms}")
    private Duration maxWait;

    @Value("${spring.data.redis.lettuce.shutdown-timeout:100ms}")
    private Duration shutdownTimeout;

    @Bean
    @Primary
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration serverConfig = new RedisStandaloneConfiguration();
        boolean useSsl = sslEnabled;

        if (redisUrl != null && !redisUrl.isBlank()) {
            log.info("Configuring Redis using REDIS_URL standard mode");
            RedisURI uri = RedisURI.create(redisUrl.trim());
            serverConfig.setHostName(uri.getHost());
            serverConfig.setPort(uri.getPort());
            if (uri.getPassword() != null && uri.getPassword().length > 0) {
                serverConfig.setPassword(RedisPassword.of(new String(uri.getPassword())));
            }
            if (uri.getUsername() != null && !uri.getUsername().isBlank()) {
                serverConfig.setUsername(uri.getUsername());
            }
            if (uri.isSsl() || (uri.getHost() != null && uri.getHost().contains("upstash.io"))) {
                useSsl = true;
            }
        } else {
            log.info("Configuring Redis using host/port mode: {}:{}", redisHost, redisPort);
            serverConfig.setHostName(redisHost);
            serverConfig.setPort(redisPort);
            if (redisPassword != null && !redisPassword.isBlank()) {
                serverConfig.setPassword(RedisPassword.of(redisPassword));
            }
            if (redisHost != null && redisHost.contains("upstash.io")) {
                useSsl = true;
            }
        }

        SocketOptions socketOptions = SocketOptions.builder()
                .connectTimeout(connectTimeout)
                .build();

        ClientOptions clientOptions = ClientOptions.builder()
                .socketOptions(socketOptions)
                .autoReconnect(true)
                .build();

        GenericObjectPoolConfig<?> poolConfig = new GenericObjectPoolConfig<>();
        poolConfig.setMaxTotal(maxActive);
        poolConfig.setMaxIdle(maxIdle);
        poolConfig.setMinIdle(minIdle);
        poolConfig.setMaxWait(maxWait);

        LettucePoolingClientConfiguration.LettucePoolingClientConfigurationBuilder builder =
                LettucePoolingClientConfiguration.builder()
                        .poolConfig(poolConfig)
                        .commandTimeout(commandTimeout)
                        .shutdownTimeout(shutdownTimeout)
                        .clientOptions(clientOptions);

        if (useSsl) {
            log.info("Enabling SSL/TLS for Lettuce Redis Connection");
            builder.useSsl();
        }

        LettuceClientConfiguration clientConfig = builder.build();
        LettuceConnectionFactory factory = new LettuceConnectionFactory(serverConfig, clientConfig);
        factory.setValidateConnection(false);
        return factory;
    }

    @Bean
    @Primary
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();

        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    @Primary
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        StringRedisTemplate template = new StringRedisTemplate();
        template.setConnectionFactory(connectionFactory);
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public ChannelTopic topic() {
        return new ChannelTopic(TOPIC);
    }

    @Bean
    public MessageListenerAdapter messageListener(RedisSubscriber redisSubscriber) {
        return new MessageListenerAdapter(redisSubscriber);
    }

    @Bean("redisListenerExecutor")
    public Executor redisListenerExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("redis-listener-");
        executor.initialize();
        return executor;
    }

    @Bean
    @ConditionalOnProperty(name = "spring.data.redis.enabled", havingValue = "true", matchIfMissing = true)
    public RedisMessageListenerContainer redisContainer(
            RedisConnectionFactory connectionFactory,
            MessageListenerAdapter messageListener,
            ChannelTopic topic,
            Executor redisListenerExecutor) {

        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setTaskExecutor(redisListenerExecutor);
        container.addMessageListener(messageListener, topic);
        container.setErrorHandler(e -> log.error("Redis Listener error: {}", e.getMessage(), e));
        return container;
    }
}
