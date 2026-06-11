package com.exaple.codeEditer.Code.Editor.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@AllArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final com.exaple.codeEditer.Code.Editor.repository.UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {


        String jwt = null;
        
        // 1. Try to read from cookies
        if (request.getCookies() != null) {
            for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
                if ("accessToken".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        // 2. Fallback to Authorization header
        if (jwt == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
            }
        }

        if (jwt == null || !jwtService.isTokenValid(jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        String email = jwtService.extractEmail(jwt);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Check if token was issued before last logout
            var user = userRepository.findByEmail(email).orElse(null);
            if (user != null && user.getLastLogoutAt() != null) {
                java.util.Date issuedAt = jwtService.extractIssuedAt(jwt);
                java.time.LocalDateTime issuedAtLDT = issuedAt.toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDateTime();
                
                if (issuedAtLDT.isBefore(user.getLastLogoutAt())) {
                    filterChain.doFilter(request, response);
                    return;
                }
            }

            var userDetails = userDetailsService.loadUserByUsername(email);

            var authToken = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities()
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}