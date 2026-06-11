package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.RuntimeImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RuntimeImageRepository extends JpaRepository<RuntimeImage, String> {
    List<RuntimeImage> findByLanguage(String language);
    Optional<RuntimeImage> findByImageTag(String imageTag);
}
