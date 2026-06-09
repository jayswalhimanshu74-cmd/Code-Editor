package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.YjsDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface YjsDocumentRepository extends JpaRepository<YjsDocument, String> {

    // Find by room + file (null fileId = main buffer)
    Optional<YjsDocument> findByRoomIdAndFileId(String roomId, String fileId);

    // Find main buffer (no file selected)
    Optional<YjsDocument> findByRoomIdAndFileIdIsNull(String roomId);

    // Delete all docs when room is deleted
    void deleteAllByRoomId(String roomId);
}