package com.exaple.codeEditer.Code.Editor.controller;

import com.exaple.codeEditer.Code.Editor.entity.RuntimeImage;
import com.exaple.codeEditer.Code.Editor.service.RuntimeRegistryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/runtimes")
@RequiredArgsConstructor
public class RuntimeRegistryController {

    private final RuntimeRegistryService runtimeRegistryService;

    @GetMapping
    public ResponseEntity<List<RuntimeImage>> getAllRuntimes() {
        return ResponseEntity.ok(runtimeRegistryService.getAllRuntimes());
    }
}
