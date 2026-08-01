package com.exaple.codeEditer.Code.Editor.service.execution;

public interface ExecutionProvider {
    /**
     * Executes user code asynchronously or via remote API provider.
     *
     * @param language   Programming language (e.g. javascript, python, java, c, cpp, go, rust)
     * @param sourceCode Code content to run
     * @param stdin      Optional standard input string
     * @return ExecutionResult containing stdout, stderr, exitCode, durationMs, and status
     */
    ExecutionResult execute(String language, String sourceCode, String stdin);

    default String getProviderName() {
        return getClass().getSimpleName();
    }
}
