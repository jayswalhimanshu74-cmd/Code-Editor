package com.exaple.codeEditer.Code.Editor.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.model.Bind;
import com.github.dockerjava.api.model.ExposedPort;
import com.github.dockerjava.api.model.HostConfig;
import com.github.dockerjava.api.model.Ports;
import com.github.dockerjava.api.model.Volume;
import com.github.dockerjava.api.model.Network;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TraefikManagerService {

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private DockerClient dockerClient;
    public static final String NETWORK_NAME = "Cloud-ide-network";
    public static final String TRAEFIK_CONTAINER_NAME = "ide-traefik";
    public static final String TRAEFIK_CONFIG_DIR = System.getProperty("user.dir") + "/traefik-config";

    public static final String PROXY_CONTAINER_NAME = "ide-docker-proxy";

    @PostConstruct
    public void init() {
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                ensureNetworkExists();
                ensureTraefikConfigDirExists();
                ensureDockerProxyRunning();
                ensureTraefikRunning();
            } catch (Throwable t) {
                log.warn("Warning: Traefik initialization failed. Is Docker Desktop running? Proceeding without Traefik.");
            }
        });
    }

    private void ensureNetworkExists() {
        List<Network> networks = dockerClient.listNetworksCmd().withNameFilter(NETWORK_NAME).exec();
        if (networks.isEmpty()) {
            dockerClient.createNetworkCmd().withName(NETWORK_NAME).exec();
            log.info("Created Docker network: {}", NETWORK_NAME);
        } else {
            log.info("Docker network {} already exists.", NETWORK_NAME);
        }
    }

    private void ensureTraefikConfigDirExists() {
        File dir = new File(TRAEFIK_CONFIG_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    private void ensureDockerProxyRunning() {
        try {
            dockerClient.inspectContainerCmd(PROXY_CONTAINER_NAME).exec();
            log.info("Docker Socket Proxy is already running.");
        } catch (Exception e) {
            log.info("Docker Socket Proxy not found. Starting proxy...");
            startDockerProxy();
        }
    }

    private void startDockerProxy() {
        try {
            try {
                dockerClient.removeContainerCmd(PROXY_CONTAINER_NAME).withForce(true).exec();
            } catch (Exception ignored) {}

            try {
                log.info("Pulling tecnativa/docker-socket-proxy:latest image...");
                dockerClient.pullImageCmd("tecnativa/docker-socket-proxy:latest").start().awaitCompletion();
            } catch (Exception e) {
                log.warn("Failed to pull docker-socket-proxy image. Proceeding anyway...", e);
            }

            HostConfig hostConfig = HostConfig.newHostConfig()
                    .withNetworkMode(NETWORK_NAME)
                    .withBinds(new Bind("/var/run/docker.sock", new Volume("/var/run/docker.sock")));

            CreateContainerResponse container = dockerClient.createContainerCmd("tecnativa/docker-socket-proxy:latest")
                    .withName(PROXY_CONTAINER_NAME)
                    .withEnv(
                        "CONTAINERS=1",
                        "NETWORKS=1",
                        "SERVICES=1",
                        "POST=0" // Enforce READ-ONLY. Block all write requests (POST/DELETE/PUT)!
                    )
                    .withHostConfig(hostConfig)
                    .exec();

            dockerClient.startContainerCmd(container.getId()).exec();
            log.info("Started Docker Socket Proxy successfully.");
        } catch (Exception e) {
            log.error("Failed to start Docker Socket Proxy container.", e);
        }
    }

    private void ensureTraefikRunning() {
        try {
            dockerClient.inspectContainerCmd(TRAEFIK_CONTAINER_NAME).exec();
            log.info("Traefik container is already running.");
        } catch (Exception e) {
            log.info("Traefik container not found. Starting Traefik...");
            startTraefik();
        }
    }

    private void startTraefik() {
        try {
            // Cleanup just in case it's in a bad state
            try {
                dockerClient.removeContainerCmd(TRAEFIK_CONTAINER_NAME).withForce(true).exec();
            } catch (Exception ignored) {}

            Ports portBindings = new Ports();
            portBindings.bind(ExposedPort.tcp(80), Ports.Binding.bindPort(8081)); // Expose preview on 8081
            portBindings.bind(ExposedPort.tcp(8080), Ports.Binding.bindPort(8082)); // Expose dashboard on 8082

            try {
                log.info("Pulling traefik:v2.10 image...");
                dockerClient.pullImageCmd("traefik:v2.10").start().awaitCompletion();
            } catch (Exception e) {
                log.warn("Failed to pull traefik image. Proceeding anyway...", e);
            }

            // Secure HostConfig: DO NOT mount /var/run/docker.sock anymore!
            HostConfig hostConfig = HostConfig.newHostConfig()
                    .withNetworkMode(NETWORK_NAME)
                    .withPortBindings(portBindings)
                    .withBinds(
                            new Bind(TRAEFIK_CONFIG_DIR, new Volume("/etc/traefik/dynamic"))
                    );

            CreateContainerResponse container = dockerClient.createContainerCmd("traefik:v2.10")
                    .withName(TRAEFIK_CONTAINER_NAME)
                    .withExposedPorts(ExposedPort.tcp(80), ExposedPort.tcp(8080))
                    .withCmd(
                            "--api.insecure=true",
                            "--providers.docker=true",
                            "--providers.docker.exposedbydefault=false",
                            "--providers.docker.endpoint=tcp://" + PROXY_CONTAINER_NAME + ":2375", // Route to secure proxy
                            "--providers.file.directory=/etc/traefik/dynamic",
                            "--providers.file.watch=true",
                            "--entrypoints.web.address=:80"
                    )
                    .withHostConfig(hostConfig)
                    .exec();

            dockerClient.startContainerCmd(container.getId()).exec();
            log.info("Started Traefik container successfully.");
        } catch (Exception e) {
            log.error("Failed to start Traefik container.", e);
        }
    }
}
