package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.ChatMessage;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {


    // existing methods — keep whatever was already here
    List<ChatMessage> findByRoom(Room room);

    // new method — uses @Query with FETCH JOIN and Pageable parameters
    @Query("SELECT c FROM ChatMessage c JOIN FETCH c.sender WHERE c.room = :room ORDER BY c.sentAt ASC")
    List<ChatMessage> findRecentByRoom(@org.springframework.data.repository.query.Param("room") Room room, org.springframework.data.domain.Pageable pageable);
}