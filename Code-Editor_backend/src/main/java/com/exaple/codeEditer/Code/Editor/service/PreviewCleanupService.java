package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PreviewCleanupService {

    public void cleanupStalePreviews() {
        log.info("Preview cleanup sweep running.");
    }
}
