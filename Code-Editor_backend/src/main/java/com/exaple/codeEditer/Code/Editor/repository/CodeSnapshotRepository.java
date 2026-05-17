package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.CodeSnapshot;
import com.exaple.codeEditer.Code.Editor.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CodeSnapshotRepository extends JpaRepository<CodeSnapshot, UUID> {
    List<CodeSnapshot> findByFileOrderByCreatedAtDesc(File file); // newest first
    List<CodeSnapshot> findTop5ByFileOrderByCreatedAtDesc(File file); // last 5 only
}