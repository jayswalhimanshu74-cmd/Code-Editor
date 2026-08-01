package com.exaple.codeEditer.Code.Editor.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseIndexInitializer {

    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void initializeIndexes() {
        try {
            log.info("Creating partial unique index for yjs_documents if not exists...");
            jdbcTemplate.execute(
                "CREATE UNIQUE INDEX IF NOT EXISTS idx_yjs_documents_room_file_null " +
                "ON yjs_documents (room_id) " +
                "WHERE file_id IS NULL"
            );
            log.info("Partial unique index for yjs_documents created/verified successfully.");
        } catch (Exception e) {
            log.warn("Failed to create partial unique index for yjs_documents (this is expected if not running on PostgreSQL/H2): {}", e.getMessage());
        }
    }
}
