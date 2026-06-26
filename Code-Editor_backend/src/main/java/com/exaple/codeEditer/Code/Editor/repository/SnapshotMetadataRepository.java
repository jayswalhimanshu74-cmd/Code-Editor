package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.SnapshotMetadataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SnapshotMetadataRepository extends JpaRepository<SnapshotMetadataEntity, Long> {
    Optional<SnapshotMetadataEntity> findBySnapshotId(String snapshotId);
    void deleteBySnapshotId(String snapshotId);
}
