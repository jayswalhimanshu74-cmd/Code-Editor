package com.exaple.codeEditer.Code.Editor.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.model.Container;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContainerDiscoveryService {

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private DockerClient dockerClient;

    public Optional<String> findRunningContainer(String roomId) {
        try {
            String containerName = "workspace-" + roomId;
            List<Container> containers = dockerClient.listContainersCmd()
                    .withShowAll(true)
                    .exec();
            
            for (Container c : containers) {
                for (String name : c.getNames()) {
                    // Docker names start with a leading slash
                    if (name.equals("/" + containerName) || name.equals(containerName)) {
                        if (c.getState() != null && c.getState().equalsIgnoreCase("running")) {
                            return Optional.of(c.getId());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to discover running container for workspace {}: {}", roomId, e.getMessage());
        }
        return Optional.empty();
    }
}
