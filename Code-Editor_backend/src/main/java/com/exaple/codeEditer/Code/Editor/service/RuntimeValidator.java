package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuntimeValidator {

    public boolean validateRuntime(String containerId, RuntimeDefinition def) {
        log.info("Validating runtime definition {} for workspace {}", def.getId(), containerId);
        return def != null && def.getLanguage() != null;
    }
}
