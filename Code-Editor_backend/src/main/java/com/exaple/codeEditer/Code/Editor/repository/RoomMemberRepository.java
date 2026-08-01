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

    @org.springframework.data.jpa.repository.Query("SELECT rm.room FROM RoomMember rm JOIN FETCH rm.room.owner WHERE rm.user = :user")
    List<Room> findRoomsByUserWithOwner(@org.springframework.data.repository.query.Param("user") User user);

    @org.springframework.data.jpa.repository.Query("SELECT rm FROM RoomMember rm JOIN FETCH rm.user WHERE rm.room IN :rooms")
    List<RoomMember> findByRoomInWithUser(@org.springframework.data.repository.query.Param("rooms") List<Room> rooms);

    @org.springframework.data.jpa.repository.Query("SELECT rm FROM RoomMember rm JOIN FETCH rm.user WHERE rm.room = :room")
    List<RoomMember> findByRoomWithUser(@org.springframework.data.repository.query.Param("room") Room room);

    void deleteByRoom(Room room);

    Optional<RoomMember> findByRoomAndUser(Room room, User user);
    boolean existsByRoomAndUser(Room room, User user);
    boolean existsByRoomIdAndUserEmail(UUID roomId, String email);
    Optional<RoomMember> findByRoomIdAndUserEmail(UUID roomId, String email);
}
