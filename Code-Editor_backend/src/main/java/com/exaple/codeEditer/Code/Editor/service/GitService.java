package com.exaple.codeEditer.Code.Editor.service;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import org.eclipse.jgit.lib.Constants;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectLoader;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathFilter;

@Service
@Slf4j
public class GitService {

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

    public boolean initRepository(String roomId) {
        File repoDir = Paths.get(HOST_WORKSPACES_DIR, roomId).toFile();
        if (!repoDir.exists() && !repoDir.mkdirs()) {
            log.error("Failed to create workspace directory for git init");
            return false;
        }

        try (Git git = Git.init().setDirectory(repoDir).call()) {
            log.info("Initialized Git repository for room: {}", roomId);
            return true;
        } catch (GitAPIException e) {
            log.error("Error initializing git repository for room {}", roomId, e);
            return false;
        }
    }

    public Map<String, Object> getStatus(String roomId) {
        File repoDir = Paths.get(HOST_WORKSPACES_DIR, roomId).toFile();
        Map<String, Object> statusMap = new HashMap<>();

        if (!new File(repoDir, ".git").exists()) {
            statusMap.put("isRepo", false);
            return statusMap;
        }

        try (Git git = Git.open(repoDir)) {
            Status status = git.status().call();
            statusMap.put("isRepo", true);
            statusMap.put("added", status.getAdded());
            statusMap.put("changed", status.getChanged());
            statusMap.put("missing", status.getMissing());
            statusMap.put("modified", status.getModified());
            statusMap.put("removed", status.getRemoved());
            statusMap.put("untracked", status.getUntracked());
            return statusMap;
        } catch (IOException | GitAPIException e) {
            log.error("Error getting git status for room {}", roomId, e);
            statusMap.put("error", e.getMessage());
            return statusMap;
        }
    }

    public boolean commitChanges(String roomId, String message, String authorName, String authorEmail) {
        File repoDir = Paths.get(HOST_WORKSPACES_DIR, roomId).toFile();
        try (Git git = Git.open(repoDir)) {
            // Stage all changes (equivalent to `git add .`)
            git.add().addFilepattern(".").call();
            
            // Commit
            git.commit()
               .setMessage(message)
               .setAuthor(authorName, authorEmail)
               .call();
            
            log.info("Successfully committed changes in room: {}", roomId);
            return true;
        } catch (IOException | GitAPIException e) {
            log.error("Error committing changes in room {}", roomId, e);
            return false;
        }
    }

    public String getFileContentFromHead(String roomId, String filePath) {
        File repoDir = Paths.get(HOST_WORKSPACES_DIR, roomId).toFile();
        if (!new File(repoDir, ".git").exists()) {
            return "";
        }
        
        try (Git git = Git.open(repoDir); Repository repository = git.getRepository()) {
            ObjectId head = repository.resolve(Constants.HEAD);
            if (head == null) return ""; // No commits yet
            
            try (RevWalk revWalk = new RevWalk(repository)) {
                RevCommit commit = revWalk.parseCommit(head);
                RevTree tree = commit.getTree();
                
                try (TreeWalk treeWalk = new TreeWalk(repository)) {
                    treeWalk.addTree(tree);
                    treeWalk.setRecursive(true);
                    treeWalk.setFilter(PathFilter.create(filePath));
                    
                    if (!treeWalk.next()) return ""; // File not found in HEAD
                    
                    ObjectId objectId = treeWalk.getObjectId(0);
                    ObjectLoader loader = repository.open(objectId);
                    return new String(loader.getBytes(), StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            log.error("Error reading file {} from HEAD for room {}", filePath, roomId, e);
            return "";
        }
    }
}
