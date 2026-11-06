package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.YjsDocument;
import com.exaple.codeEditer.Code.Editor.repository.FileRepository;
import com.exaple.codeEditer.Code.Editor.repository.YjsDocumentRepository;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.Map;
import java.util.concurrent.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class YjsDocumentService {

    private final YjsDocumentRepository yjsRepo;
    private final FileRepository fileRepository;
    private final StringRedisTemplate stringRedisTemplate;

    private static final String REDIS_DOC_PREFIX = "yjs:doc:";
    private final Map<String, byte[]> liveDocCache = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> pendingTasks = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    private String buildKey(String roomId, String fileId) {
        return roomId + (fileId != null && !fileId.isBlank() ? ":" + fileId : "");
    }

    /**
     * Fetch the latest state:
     * 1. Flush any pending save for this document first.
     * 2. Check live in-memory cache.
     * 3. Check Redis cache.
     * 4. Query PostgreSQL DB.
     */
    public byte[] getState(String roomId, String fileId) {
        String key = buildKey(roomId, fileId);

        // 1. Flush if a save is pending
        flushPendingSave(key);

        // 2. Check live in-memory cache
        byte[] inMemory = liveDocCache.get(key);
        if (inMemory != null && inMemory.length > 0) {
            log.debug("[Yjs State] Served from in-memory cache: roomId={}, fileId={}, bytes={}", roomId, fileId, inMemory.length);
            return inMemory;
        }

        // 3. Check Redis cache
        try {
            String redisVal = stringRedisTemplate.opsForValue().get(REDIS_DOC_PREFIX + key);
            if (redisVal != null && !redisVal.isBlank()) {
                byte[] fromRedis = Base64.getDecoder().decode(redisVal.trim());
                liveDocCache.put(key, fromRedis);
                log.debug("[Yjs State] Served from Redis: roomId={}, fileId={}, bytes={}", roomId, fileId, fromRedis.length);
                return fromRedis;
            }
        } catch (Exception e) {
            log.warn("[Yjs State] Failed to read from Redis for key {}: {}", key, e.getMessage());
        }

        // 4. Query PostgreSQL database
        var optDoc = (fileId != null && !fileId.isBlank())
                ? yjsRepo.findByRoomIdAndFileId(roomId, fileId)
                : yjsRepo.findByRoomIdAndFileIdIsNull(roomId);

        if (optDoc.isPresent() && optDoc.get().getState() != null) {
            byte[] dbState = optDoc.get().getState();
            liveDocCache.put(key, dbState);
            try {
                stringRedisTemplate.opsForValue().set(
                        REDIS_DOC_PREFIX + key,
                        Base64.getEncoder().encodeToString(dbState),
                        24,
                        TimeUnit.HOURS
                );
            } catch (Exception e) {
                log.warn("[Yjs State] Failed to warm Redis cache for key {}: {}", key, e.getMessage());
            }
            log.debug("[Yjs State] Served from PostgreSQL: roomId={}, fileId={}, bytes={}", roomId, fileId, dbState.length);
            return dbState;
        }

        log.debug("[Yjs State] No state found in DB or cache for roomId={}, fileId={}", roomId, fileId);
        return null;
    }

    /**
     * Save document state:
     * Updates in-memory and Redis cache immediately.
     * Debounces or flushes DB persistence.
     */
    public void saveState(String roomId, String fileId, byte[] stateBytes, boolean immediate) {
        String key = buildKey(roomId, fileId);
        liveDocCache.put(key, stateBytes);

        // Save to Redis immediately
        try {
            stringRedisTemplate.opsForValue().set(
                    REDIS_DOC_PREFIX + key,
                    Base64.getEncoder().encodeToString(stateBytes),
                    24,
                    TimeUnit.HOURS
            );
        } catch (Exception e) {
            log.warn("[Yjs State] Failed to persist state to Redis for key {}: {}", key, e.getMessage());
        }

        if (immediate) {
            flushPendingSave(key);
            persistToDb(roomId, fileId, stateBytes);
        } else {
            // Cancel previous debounced task if still scheduled
            ScheduledFuture<?> prev = pendingTasks.remove(key);
            if (prev != null) {
                prev.cancel(false);
            }

            ScheduledFuture<?> task = scheduler.schedule(() -> {
                try {
                    pendingTasks.remove(key);
                    byte[] latest = liveDocCache.get(key);
                    if (latest != null) {
                        persistToDb(roomId, fileId, latest);
                    }
                } catch (Exception e) {
                    log.error("[Yjs State] Error during scheduled DB flush for key {}: {}", key, e.getMessage(), e);
                }
            }, 2000, TimeUnit.MILLISECONDS);

            pendingTasks.put(key, task);
        }
    }

    /**
     * Synchronously flushes any pending debounced save for a given key.
     */
    public synchronized void flushPendingSave(String key) {
        ScheduledFuture<?> task = pendingTasks.remove(key);
        if (task != null) {
            task.cancel(false);
            byte[] state = liveDocCache.get(key);
            if (state != null) {
                String[] parts = key.split(":", 2);
                String roomId = parts[0];
                String fileId = parts.length > 1 ? parts[1] : null;
                persistToDb(roomId, fileId, state);
            }
        }
    }

    /**
     * Flush all pending saves associated with a given roomId (called on session disconnect).
     */
    public synchronized void flushAllForRoom(String roomId) {
        log.info("[Yjs State] Flushing all pending saves for room: {}", roomId);
        for (String key : pendingTasks.keySet()) {
            if (key.startsWith(roomId)) {
                flushPendingSave(key);
            }
        }
    }

    private void persistToDb(String roomId, String fileId, byte[] state) {
        try {
            YjsDocument doc;
            if (fileId != null && !fileId.isBlank()) {
                doc = yjsRepo.findByRoomIdAndFileId(roomId, fileId)
                        .orElseGet(() -> YjsDocument.builder()
                                .roomId(roomId)
                                .fileId(fileId)
                                .build());
            } else {
                doc = yjsRepo.findByRoomIdAndFileIdIsNull(roomId)
                        .orElseGet(() -> YjsDocument.builder()
                                .roomId(roomId)
                                .build());
            }
            doc.setState(state);
            yjsRepo.save(doc);
            log.debug("[Yjs State] Flushed state to DB: roomId={}, fileId={}, bytes={}", roomId, fileId, state.length);
        } catch (Exception e) {
            log.error("[Yjs State] Failed to persist state to DB for room={}, file={}: {}", roomId, fileId, e.getMessage(), e);
        }
    }

    @PreDestroy
    public void cleanup() {
        log.info("[Yjs State] Shutting down YjsDocumentService. Flushing all pending saves...");
        for (String key : pendingTasks.keySet()) {
            flushPendingSave(key);
        }
        scheduler.shutdown();
    }
}

