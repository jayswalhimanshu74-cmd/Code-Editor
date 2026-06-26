package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuntimeManager {

    private final RuntimeRegistry runtimeRegistry;
    private final RuntimeSelector runtimeSelector;
    private final RuntimeValidator runtimeValidator;

    public boolean checkContainerRuntime(String containerId, String filename) {
        Optional<RuntimeDefinition> defOpt = runtimeSelector.selectByFilename(filename);
        if (defOpt.isEmpty()) {
            log.info("No specific runtime definition found for file: {}", filename);
            return true; // Proceed with base container
        }

        RuntimeDefinition def = defOpt.get();
        return runtimeValidator.validateRuntime(containerId, def);
    }

    public Optional<RuntimeDefinition> getRuntimeForLanguage(String language) {
        return runtimeRegistry.getByLanguage(language);
    }
}
