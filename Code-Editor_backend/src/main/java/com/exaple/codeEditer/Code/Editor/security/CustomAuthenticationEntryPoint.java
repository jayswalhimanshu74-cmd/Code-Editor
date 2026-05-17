package com.exaple.codeEditer.Code.Editor.security;

import com.exaple.codeEditer.Code.Editor.dto.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) 
            throws IOException, ServletException {
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpStatus.UNAUTHORIZED.value());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message("Unauthorized: " + authException.getMessage())
                .timestamp(LocalDateTime.now())
                .build();

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
