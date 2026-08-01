package com.exaple.codeEditer.Code.Editor.health;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
public class WorkspaceHealthIndicator implements HealthIndicator {

    @Value("${workspace.root.path:cloud-workspaces}")
    private String workspaceRootPath;

    @Override
    public Health health() {
        try {
            Path rootPath = Path.of(workspaceRootPath);
            if (!Files.exists(rootPath)) {
                Files.createDirectories(rootPath);
            }

            File file = rootPath.toFile();
            boolean isWritable = file.canWrite();
            long usableSpaceBytes = file.getUsableSpace();
            long totalSpaceBytes = file.getTotalSpace();

            if (!isWritable) {
                return Health.down()
                        .withDetail("workspaceRoot", workspaceRootPath)
                        .withDetail("error", "Workspace root directory is not writable")
                        .build();
            }

            return Health.up()
                    .withDetail("workspaceRoot", workspaceRootPath)
                    .withDetail("writable", true)
                    .withDetail("usableSpaceMB", usableSpaceBytes / (1024 * 1024))
                    .withDetail("totalSpaceMB", totalSpaceBytes / (1024 * 1024))
                    .build();

        } catch (Exception e) {
            return Health.down(e)
                    .withDetail("workspaceRoot", workspaceRootPath)
                    .build();
        }
    }
}
