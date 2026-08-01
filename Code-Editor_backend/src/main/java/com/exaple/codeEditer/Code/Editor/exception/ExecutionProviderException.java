package com.exaple.codeEditer.Code.Editor.exception;

public class ExecutionProviderException extends RuntimeException {
    public ExecutionProviderException(String message) {
        super(message);
    }

    public ExecutionProviderException(String message, Throwable cause) {
        super(message, cause);
    }
}
