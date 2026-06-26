package com.exaple.codeEditer.Code.Editor.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RuntimeSelector {

    private final RuntimeRegistry runtimeRegistry;

    public Optional<RuntimeDefinition> selectByFilename(String filename) {
        if (filename == null || !filename.contains(".")) {
            return Optional.empty();
        }

        String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

        switch (ext) {
            case "js":
            case "jsx":
            case "ts":
            case "tsx":
                return runtimeRegistry.getByLanguage("javascript");
            case "py":
                return runtimeRegistry.getByLanguage("python");
            case "java":
                return runtimeRegistry.getByLanguage("java");
            case "go":
                return runtimeRegistry.getByLanguage("go");
            case "rs":
                return runtimeRegistry.getByLanguage("rust");
            case "cpp":
            case "cc":
            case "h":
                return runtimeRegistry.getByLanguage("cpp");
            default:
                return Optional.empty();
        }
    }
}
