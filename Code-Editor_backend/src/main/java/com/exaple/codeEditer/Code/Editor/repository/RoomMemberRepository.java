package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.Room;
import com.exaple.codeEditer.Code.Editor.entity.RoomMember;
import com.exaple.codeEditer.Code.Editor.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    List<RoomMember> findByRoom(Room room);
    List<RoomMember> findByUser(User user);

    void deleteByRoom(Room room);

    Optional<RoomMember> findByRoomAndUser(Room room, User user);
    boolean existsByRoomAndUser(Room room, User user);
    boolean existsByRoomIdAndUserEmail(UUID roomId, String email);
}
