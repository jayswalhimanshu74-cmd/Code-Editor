package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
    Optional<Room> findByInviteCode(String inviteCode);
    List<Room> findByOwner(User owner);
    boolean existsByInviteCode(String inviteCode);

}