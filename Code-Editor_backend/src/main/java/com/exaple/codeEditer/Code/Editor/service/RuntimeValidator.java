package com.exaple.codeEditer.Code.Editor.service;

import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.ExecCreateCmdResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuntimeValidator {

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private DockerClient dockerClient;

    public boolean validateRuntime(String containerId, RuntimeDefinition def) {
        log.info("Validating runtime {} in container {}", def.getId(), containerId);
        try {
            String[] cmdArgs = def.getVersionQueryCommand().split("\\s+");

            ExecCreateCmdResponse execCreateCmdResponse = dockerClient.execCreateCmd(containerId)
                    .withAttachStdout(true)
                    .withAttachStderr(true)
                    .withCmd(cmdArgs)
                    .exec();

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            dockerClient.execStartCmd(execCreateCmdResponse.getId())
                    .exec(new com.github.dockerjava.api.async.ResultCallback.Adapter<com.github.dockerjava.api.model.Frame>() {
                        @Override
                        public void onNext(com.github.dockerjava.api.model.Frame frame) {
                            try {
                                outputStream.write(frame.getPayload());
                            } catch (Exception ignored) {}
                        }
                    }).awaitCompletion();

            String output = outputStream.toString().trim();
            log.info("Runtime validation output for {}: {}", def.getId(), output);

            return !output.isEmpty();
        } catch (Exception e) {
            log.warn("Runtime validation failed for {} in container {}: {}", def.getId(), containerId, e.getMessage());
            return false;
        }
    }
}
