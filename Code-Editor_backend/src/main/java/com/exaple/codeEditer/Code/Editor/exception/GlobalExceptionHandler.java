package com.exaple.codeEditer.Code.Editor.exception;

import com.exaple.codeEditer.Code.Editor.config.CorrelationIdFilter;
import com.exaple.codeEditer.Code.Editor.dto.ProblemDetailResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String PROBLEM_BASE_URL = "https://hencecode.com/errors/";

    // 1. Validation Exception Handlers (HTTP 400 / 422)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetailResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        log.warn("Validation failed for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        List<ProblemDetailResponse.InvalidParam> invalidParams = new ArrayList<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                invalidParams.add(ProblemDetailResponse.InvalidParam.builder()
                        .name(error.getField())
                        .reason(error.getDefaultMessage())
                        .build())
        );

        ProblemDetailResponse response = buildProblemDetail(
                "validation-error",
                "Validation Error",
                HttpStatus.BAD_REQUEST,
                "One or more fields failed validation requirements.",
                request,
                invalidParams
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetailResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {

        log.warn("Constraint violation for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        List<ProblemDetailResponse.InvalidParam> invalidParams = new ArrayList<>();
        ex.getConstraintViolations().forEach(violation ->
                invalidParams.add(ProblemDetailResponse.InvalidParam.builder()
                        .name(violation.getPropertyPath().toString())
                        .reason(violation.getMessage())
                        .build())
        );

        ProblemDetailResponse response = buildProblemDetail(
                "constraint-violation",
                "Constraint Violation",
                HttpStatus.BAD_REQUEST,
                "Request parameter failed constraint check.",
                request,
                invalidParams
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 2. Resource Not Found Exception Handler (HTTP 404)
    @ExceptionHandler({ResourceNotFoundException.class, EntityNotFoundException.class})
    public ResponseEntity<ProblemDetailResponse> handleResourceNotFound(
            Exception ex, HttpServletRequest request) {

        log.warn("Resource not found for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ProblemDetailResponse response = buildProblemDetail(
                "resource-not-found",
                "Resource Not Found",
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 3. Authentication Exception Handler (HTTP 401)
    @ExceptionHandler({BadCredentialsException.class, AuthenticationException.class, UnauthorizedException.class})
    public ResponseEntity<ProblemDetailResponse> handleAuthenticationException(
            Exception ex, HttpServletRequest request) {

        log.warn("Authentication failed for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ProblemDetailResponse response = buildProblemDetail(
                "unauthorized",
                "Authentication Required",
                HttpStatus.UNAUTHORIZED,
                "Invalid authentication credentials or token expired.",
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 4. Authorization Exception Handler (HTTP 403)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetailResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {

        log.warn("Access denied for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ProblemDetailResponse response = buildProblemDetail(
                "forbidden",
                "Access Denied",
                HttpStatus.FORBIDDEN,
                "You do not have permission to access the requested resource.",
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 5. Workspace Exception Handler (HTTP 400 / 500)
    @ExceptionHandler(WorkspaceException.class)
    public ResponseEntity<ProblemDetailResponse> handleWorkspaceException(
            WorkspaceException ex, HttpServletRequest request) {

        log.error("Workspace operation failed for request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ProblemDetailResponse response = buildProblemDetail(
                "workspace-error",
                "Workspace Error",
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(),
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 6. Execution Provider Exception Handler (HTTP 502 Bad Gateway)
    @ExceptionHandler(ExecutionProviderException.class)
    public ResponseEntity<ProblemDetailResponse> handleExecutionProviderException(
            ExecutionProviderException ex, HttpServletRequest request) {

        log.error("Code execution engine failure for request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ProblemDetailResponse response = buildProblemDetail(
                "execution-engine-failure",
                "Code Execution Engine Unavailable",
                HttpStatus.BAD_GATEWAY,
                "External sandbox code execution service failed to execute the request.",
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 7. Database Exception Handler (HTTP 409 / 500)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ProblemDetailResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {

        log.error("Database constraint conflict for request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ProblemDetailResponse response = buildProblemDetail(
                "data-conflict",
                "Data Integrity Conflict",
                HttpStatus.CONFLICT,
                "Database constraint violation occurred. Entity state conflict.",
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ProblemDetailResponse> handleDatabaseException(
            DataAccessException ex, HttpServletRequest request) {

        log.error("Database access exception for request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ProblemDetailResponse response = buildProblemDetail(
                "database-error",
                "Database Error",
                HttpStatus.INTERNAL_SERVER_ERROR,
                "A database operation failed.",
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 8. Redis Exception Handler (HTTP 503 Service Unavailable)
    @ExceptionHandler(RedisConnectionFailureException.class)
    public ResponseEntity<ProblemDetailResponse> handleRedisConnectionFailure(
            RedisConnectionFailureException ex, HttpServletRequest request) {

        log.error("Redis infrastructure connection failure for request [{}]: {}", request.getRequestURI(), ex.getMessage());

        ProblemDetailResponse response = buildProblemDetail(
                "redis-unavailable",
                "Cache Infrastructure Service Unavailable",
                HttpStatus.SERVICE_UNAVAILABLE,
                "Redis cache/message broker is currently unreachable.",
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 9. HTTP Method Not Supported Handler (HTTP 405)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ProblemDetailResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {

        ProblemDetailResponse response = buildProblemDetail(
                "method-not-allowed",
                "Method Not Allowed",
                HttpStatus.METHOD_NOT_ALLOWED,
                ex.getMessage(),
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    // 10. Fallback General Exception Handler (HTTP 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetailResponse> handleGeneralException(
            Exception ex, HttpServletRequest request) {

        log.error("Unhandled internal system exception caught for request [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);

        ProblemDetailResponse response = buildProblemDetail(
                "internal-server-error",
                "Internal Server Error",
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected internal error occurred. Please contact system support with the provided Correlation ID.",
                request,
                null
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(response);
    }

    private ProblemDetailResponse buildProblemDetail(
            String typeSlug,
            String title,
            HttpStatus status,
            String detail,
            HttpServletRequest request,
            List<ProblemDetailResponse.InvalidParam> invalidParams) {

        String correlationId = MDC.get(CorrelationIdFilter.MDC_CORRELATION_ID_KEY);
        String requestId = MDC.get(CorrelationIdFilter.MDC_REQUEST_ID_KEY);

        return ProblemDetailResponse.builder()
                .type(PROBLEM_BASE_URL + typeSlug)
                .title(title)
                .status(status.value())
                .detail(detail)
                .instance(request.getRequestURI())
                .timestamp(Instant.now())
                .correlationId(correlationId)
                .requestId(requestId)
                .invalidParams(invalidParams)
                .build();
    }
}