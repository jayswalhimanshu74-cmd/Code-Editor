package com.exaple.codeEditer.Code.Editor.service;

import com.exaple.codeEditer.Code.Editor.entity.RuntimeImage;
import com.exaple.codeEditer.Code.Editor.repository.RuntimeImageRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuntimeRegistryService {

    private final RuntimeImageRepository runtimeImageRepository;

    @PostConstruct
    public void seedRegistry() {
        if (runtimeImageRepository.count() == 0) {
            log.info("Seeding Runtime Registry with default images...");

            createRuntime("Ubuntu Monolith", "cloud-ide-workspace:latest", "ubuntu", "Full enterprise environment with all dependencies.", true);
            createRuntime("Node.js 20 Alpine", "node:20-alpine", "javascript", "Minimalist Node.js 20 runtime.", false);
            createRuntime("Python 3.11 Slim", "python:3.11-slim", "python", "Lightweight Python environment.", false);
            createRuntime("Golang 1.21 Alpine", "golang:1.21-alpine", "go", "Fast compilation Go environment.", false);
            createRuntime("Java 17 Alpine", "eclipse-temurin:17-jdk-alpine", "java", "Standard Java 17 development kit.", false);
            createRuntime("C++ GCC", "gcc:latest", "cpp", "GNU C++ Compiler environment.", false);
        }
    }

    private void createRuntime(String name, String imageTag, String language, String description, boolean isDefault) {
        RuntimeImage img = new RuntimeImage();
        img.setName(name);
        img.setImageTag(imageTag);
        img.setLanguage(language);
        img.setDescription(description);
        img.setDefault(isDefault);
        runtimeImageRepository.save(img);
    }

    public List<RuntimeImage> getAllRuntimes() {
        return runtimeImageRepository.findAll();
    }

    public List<RuntimeImage> getRuntimesByLanguage(String language) {
        return runtimeImageRepository.findByLanguage(language);
    }

    public Optional<RuntimeImage> getRuntimeById(String id) {
        return runtimeImageRepository.findById(id);
    }

    public String getImageTagForRoom(String runtimeImageId, String language) {
        if (runtimeImageId != null && !runtimeImageId.isBlank()) {
            Optional<RuntimeImage> image = runtimeImageRepository.findById(runtimeImageId);
            if (image.isPresent()) {
                return image.get().getImageTag();
            }
        }
        
        // Fallback to language default or monolithic base
        List<RuntimeImage> byLang = runtimeImageRepository.findByLanguage(language);
        if (!byLang.isEmpty()) {
            return byLang.stream().filter(RuntimeImage::isDefault).findFirst()
                    .map(RuntimeImage::getImageTag)
                    .orElse(byLang.get(0).getImageTag());
        }
        
        return "cloud-ide-workspace:latest";
    }
}
