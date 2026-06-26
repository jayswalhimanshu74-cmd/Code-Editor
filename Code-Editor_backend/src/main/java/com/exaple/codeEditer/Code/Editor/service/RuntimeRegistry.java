package com.exaple.codeEditer.Code.Editor.service;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RuntimeRegistry {

    private final ConcurrentHashMap<String, RuntimeDefinition> registry = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        register(RuntimeDefinition.builder()
                .id("node-20")
                .name("Node.js 20 Runtime")
                .language("javascript")
                .imageTag("node:20-alpine")
                .versionQueryCommand("node -v")
                .expectedVersionRegex("v20\\..*")
                .build());

        register(RuntimeDefinition.builder()
                .id("python-3")
                .name("Python 3.11 Runtime")
                .language("python")
                .imageTag("python:3.11-slim")
                .versionQueryCommand("python3 --version")
                .expectedVersionRegex("Python 3\\.11\\..*")
                .build());

        register(RuntimeDefinition.builder()
                .id("java-17")
                .name("Java 17 JDK")
                .language("java")
                .imageTag("eclipse-temurin:17-jdk-alpine")
                .versionQueryCommand("java -version")
                .expectedVersionRegex(".*17\\..*")
                .build());

        register(RuntimeDefinition.builder()
                .id("go-1")
                .name("Go 1.21 Compiler")
                .language("go")
                .imageTag("golang:1.21-alpine")
                .versionQueryCommand("go version")
                .expectedVersionRegex("go version go1\\.21\\..*")
                .build());

        register(RuntimeDefinition.builder()
                .id("rust-1")
                .name("Rust 1.70 Compiler")
                .language("rust")
                .imageTag("rust:1.70-slim")
                .versionQueryCommand("rustc --version")
                .expectedVersionRegex("rustc 1\\.70\\..*")
                .build());

        register(RuntimeDefinition.builder()
                .id("cpp-gcc")
                .name("C++ GCC Compiler")
                .language("cpp")
                .imageTag("gcc:latest")
                .versionQueryCommand("g++ --version")
                .expectedVersionRegex("g\\+\\+.*")
                .build());
    }

    public void register(RuntimeDefinition def) {
        registry.put(def.getId(), def);
        registry.put(def.getLanguage().toLowerCase(), def); // Also index by language
    }

    public Optional<RuntimeDefinition> getById(String id) {
        return Optional.ofNullable(registry.get(id));
    }

    public Optional<RuntimeDefinition> getByLanguage(String language) {
        return Optional.ofNullable(registry.get(language.toLowerCase()));
    }

    public List<RuntimeDefinition> getAll() {
        return new ArrayList<>(registry.values());
    }
}
