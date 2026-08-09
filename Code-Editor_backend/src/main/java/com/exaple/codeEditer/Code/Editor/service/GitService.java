package com.exaple.codeEditer.Code.Editor.service;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
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
import java.util.List;
import java.util.ArrayList;
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
@RequiredArgsConstructor
public class GitService {

    private final com.exaple.codeEditer.Code.Editor.repository.UserRepository userRepository;
    private final com.exaple.codeEditer.Code.Editor.security.GitHubTokenEncryptor githubTokenEncryptor;
    private final PathSecurityService pathSecurityService;
    private final WorkspaceSyncService workspaceSyncService;

    private static final String HOST_WORKSPACES_DIR = System.getProperty("user.dir") + "/cloud-workspaces";

    private String getDecryptedTokenForUser(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email)
                .map(user -> {
                    String encryptedToken = user.getGithubAccessToken();
                    if (encryptedToken != null) {
                        try {
                            return githubTokenEncryptor.decrypt(encryptedToken);
                        } catch (Exception e) {
                            log.error("Failed to decrypt GitHub token for user {}", email, e);
                        }
                    }
                    return null;
                })
                .orElse(null);
    }

    private File getValidatedRepoDir(String roomId) {
        if (roomId == null) {
            throw new IllegalArgumentException("Room ID cannot be null");
        }
        pathSecurityService.validatePath(HOST_WORKSPACES_DIR, roomId);
        return Paths.get(HOST_WORKSPACES_DIR, roomId).toFile();
    }

    public boolean initRepository(String roomId) {
        if (roomId == null || !pathSecurityService.isNameSafe(roomId)) {
            log.error("Invalid roomId for git init: {}", roomId);
            return false;
        }
        File repoDir = getValidatedRepoDir(roomId);
        if (!repoDir.exists() && !repoDir.mkdirs()) {
            log.error("Failed to create workspace directory for git init");
            return false;
        }

        try (Git git = Git.init().setDirectory(repoDir).call()) {
            log.info("Initialized Git repository for room: {}", roomId);
            
            // Create a default initial commit if the repo is empty
            File gitignore = new File(repoDir, ".gitignore");
            if (!gitignore.exists()) {
                java.nio.file.Files.writeString(gitignore.toPath(), "node_modules/\ntarget/\nbuild/\ndist/\n.env.properties\n");
            }
            git.add().addFilepattern(".gitignore").call();
            git.commit()
               .setMessage("Initial commit")
               .setAuthor("Hence-Code", "support@hencecode.com")
               .call();
            
            // Sync local to DB
            workspaceSyncService.syncLocalToDatabase(roomId);
            return true;
        } catch (Exception e) {
            log.error("Error initializing git repository for room {}", roomId, e);
            return false;
        }
    }

    public Map<String, Object> getStatus(String roomId) {
        File repoDir = getValidatedRepoDir(roomId);
        Map<String, Object> statusMap = new HashMap<>();

        if (!new File(repoDir, ".git").exists()) {
            statusMap.put("isRepo", false);
            return statusMap;
        }

        // Write any pending editor changes to disk first
        workspaceSyncService.syncDatabaseToLocal(roomId);

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
        File repoDir = getValidatedRepoDir(roomId);
        
        // Write any pending editor changes to disk first
        workspaceSyncService.syncDatabaseToLocal(roomId);

        try (Git git = Git.open(repoDir)) {
            git.add().addFilepattern(".").call();
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
        File repoDir = getValidatedRepoDir(roomId);
        if (!new File(repoDir, ".git").exists()) {
            return "";
        }
        
        try (Git git = Git.open(repoDir); Repository repository = git.getRepository()) {
            ObjectId head = repository.resolve(Constants.HEAD);
            if (head == null) return "";
            
            try (RevWalk revWalk = new RevWalk(repository)) {
                RevCommit commit = revWalk.parseCommit(head);
                RevTree tree = commit.getTree();
                
                try (TreeWalk treeWalk = new TreeWalk(repository)) {
                    treeWalk.addTree(tree);
                    treeWalk.setRecursive(true);
                    treeWalk.setFilter(PathFilter.create(filePath));
                    
                    if (!treeWalk.next()) return "";
                    
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

    public boolean cloneRepository(String roomId, String repoUrl, String email) {
        String token = getDecryptedTokenForUser(email);
        File repoDir = getValidatedRepoDir(roomId);
        if (repoDir.exists()) {
            deleteDirectory(repoDir);
        }
        repoDir.mkdirs();

        try {
            org.eclipse.jgit.api.CloneCommand cloneCommand = Git.cloneRepository()
                    .setURI(repoUrl)
                    .setDirectory(repoDir);
            
            if (token != null && !token.isEmpty()) {
                cloneCommand.setCredentialsProvider(new org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider(token, ""));
            }
            
            try (Git git = cloneCommand.call()) {
                log.info("Successfully cloned repository {} to room {}", repoUrl, roomId);
                
                // If cloned repository is empty (no commits), create a default initial commit
                Repository repository = git.getRepository();
                ObjectId head = repository.resolve(Constants.HEAD);
                if (head == null) {
                    log.info("Cloned repository is empty. Creating initial commit.");
                    File gitignore = new File(repoDir, ".gitignore");
                    if (!gitignore.exists()) {
                        java.nio.file.Files.writeString(gitignore.toPath(), "node_modules/\ntarget/\nbuild/\ndist/\n.env.properties\n");
                    }
                    git.add().addFilepattern(".gitignore").call();
                    git.commit()
                       .setMessage("Initial commit")
                       .setAuthor("Hence-Code", "support@hencecode.com")
                       .call();
                }
                
                // Sync files from local disk to DB
                workspaceSyncService.syncLocalToDatabase(roomId);
                return true;
            }
        } catch (Exception e) {
            log.error("Failed to clone repository: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean pullChanges(String roomId, String email) {
        String token = getDecryptedTokenForUser(email);
        File repoDir = getValidatedRepoDir(roomId);
        try (Git git = Git.open(repoDir)) {
            org.eclipse.jgit.api.PullCommand pull = git.pull();
            if (token != null && !token.isEmpty()) {
                pull.setCredentialsProvider(new org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider(token, ""));
            }
            pull.call();
            log.info("Successfully pulled changes in room: {}", roomId);
            
            // Sync files from local disk to DB
            workspaceSyncService.syncLocalToDatabase(roomId);
            return true;
        } catch (Exception e) {
            log.error("Failed to pull changes: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean pushChanges(String roomId, String email) {
        String token = getDecryptedTokenForUser(email);
        File repoDir = getValidatedRepoDir(roomId);
        
        // Write any pending editor changes to disk first
        workspaceSyncService.syncDatabaseToLocal(roomId);

        try (Git git = Git.open(repoDir)) {
            org.eclipse.jgit.api.PushCommand push = git.push();
            if (token != null && !token.isEmpty()) {
                push.setCredentialsProvider(new org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider(token, ""));
            }
            push.call();
            log.info("Successfully pushed changes in room: {}", roomId);
            return true;
        } catch (Exception e) {
            log.error("Failed to push changes: {}", e.getMessage(), e);
            return false;
        }
    }

    public List<String> listBranches(String roomId) {
        File repoDir = getValidatedRepoDir(roomId);
        List<String> branches = new ArrayList<>();
        try (Git git = Git.open(repoDir)) {
            List<org.eclipse.jgit.lib.Ref> refs = git.branchList().setListMode(org.eclipse.jgit.api.ListBranchCommand.ListMode.ALL).call();
            for (org.eclipse.jgit.lib.Ref ref : refs) {
                branches.add(ref.getName());
            }
        } catch (Exception e) {
            log.error("Failed to list branches for room {}: {}", roomId, e.getMessage());
        }
        return branches;
    }

    public boolean createBranch(String roomId, String branchName) {
        File repoDir = getValidatedRepoDir(roomId);
        try (Git git = Git.open(repoDir)) {
            git.branchCreate().setName(branchName).call();
            log.info("Successfully created branch {} in room: {}", branchName, roomId);
            return true;
        } catch (Exception e) {
            log.error("Failed to create branch: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean checkoutBranch(String roomId, String branchName) {
        File repoDir = getValidatedRepoDir(roomId);
        try (Git git = Git.open(repoDir)) {
            git.checkout().setName(branchName).call();
            log.info("Successfully checked out branch {} in room: {}", branchName, roomId);
            
            // Sync files from local disk to DB
            workspaceSyncService.syncLocalToDatabase(roomId);
            return true;
        } catch (Exception e) {
            log.error("Failed to checkout branch: {}", e.getMessage(), e);
            return false;
        }
    }

    private void deleteDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files != null) {
            for (File f : files) {
                if (f.isDirectory()) {
                    deleteDirectory(f);
                } else {
                    f.delete();
                }
            }
        }
        dir.delete();
    }
}
