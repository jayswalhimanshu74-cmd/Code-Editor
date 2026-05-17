package com.exaple.codeEditer.Code.Editor.repository;

import com.exaple.codeEditer.Code.Editor.entity.File;
import com.exaple.codeEditer.Code.Editor.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FileRepository extends JpaRepository<File, UUID> {
    List<File> findByRoomAndParentIsNull(Room room); // root level files
    List<File> findByParent(File parent);            // children of a folder
    List<File> findByRoom(Room room);                // all files in room
}