package com.exaple.codeEditer.Code.Editor.config;

import com.exaple.codeEditer.Code.Editor.security.CustomAuthenticationEntryPoint;
import com.exaple.codeEditer.Code.Editor.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;

import java.util.List;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final com.exaple.codeEditer.Code.Editor.security.CustomOAuth2UserService customOAuth2UserService;
    private final com.exaple.codeEditer.Code.Editor.security.OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final com.exaple.codeEditer.Code.Editor.security.RateLimitFilter rateLimitFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; connect-src 'self' ws: wss: http: https:; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'"))
                        .frameOptions(org.springframework.security.config.annotation.web.configurers.HeadersConfigurer.FrameOptionsConfig::deny)
                        .contentTypeOptions(org.springframework.security.config.Customizer.withDefaults())
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .permissionsPolicy(pp -> pp.policy("geolocation=(), microphone=(), camera=()"))
                )
                .exceptionHandling(exception -> exception.authenticationEntryPoint(customAuthenticationEntryPoint))
                    .sessionManagement(s ->
                            s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(
                                    "/api/auth/**",
                                    "/ws/**",
                                    "/oauth2/**",
                                    "/login/oauth2/**"
                            ).permitAll()
                            .requestMatchers("/api/yjs/**").authenticated()
                            .anyRequest().authenticated()
                    )
                    .oauth2Login(oauth2 -> oauth2
                            .userInfoEndpoint(userInfo -> userInfo
                                    .userService(customOAuth2UserService)
                            )
                            .successHandler(oAuth2AuthenticationSuccessHandler)
                    )
                    .authenticationProvider(authenticationProvider())
                    .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                    .addFilterAfter(rateLimitFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }

    @Bean
    public org.springframework.security.authentication.AuthenticationProvider authenticationProvider() {
        org.springframework.security.authentication.dao.DaoAuthenticationProvider authProvider = new org.springframework.security.authentication.dao.DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler(PermissionEvaluator permissionEvaluator) {
        DefaultMethodSecurityExpressionHandler expressionHandler = new DefaultMethodSecurityExpressionHandler();
        expressionHandler.setPermissionEvaluator(permissionEvaluator);
        return expressionHandler;
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:8080", "https://lodging-october-standing-hospitality.trycloudflare.com"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
