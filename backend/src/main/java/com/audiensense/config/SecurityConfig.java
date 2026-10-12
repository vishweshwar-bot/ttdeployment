package com.audiensense.config;

import com.audiensense.security.JwtAuthenticationFilter;
import com.audiensense.security.JwtProperties;
import com.audiensense.security.JwtTokenProvider;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                             JwtAuthenticationFilter jwtFilter) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.POST,
                                "/auth/register", "/auth/login", "/chat", "/chat/**",
                                "/api/chat", "/api/chat/**").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/movies", "/movies/{id}", "/movies/**",
                                "/api/movies", "/api/movies/{id}", "/api/movies/**",
                                "/tv-shows", "/tv-shows/{id}", "/tv-shows/**",
                                "/api/tv-shows", "/api/tv-shows/{id}", "/api/tv-shows/**",
                                "/reviews/movie/**", "/api/reviews/movie/**")
                                .permitAll()
                        .requestMatchers(HttpMethod.GET, "/watchlist", "/watchlist/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/movies").hasRole("SYSTEM_ADMIN")
                        .requestMatchers("/admin/**").hasRole("SYSTEM_ADMIN")
                        .anyRequest().permitAll())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    JwtAuthenticationFilter jwtAuthenticationFilter(JwtTokenProvider tokenProvider) {
        return new JwtAuthenticationFilter(tokenProvider);
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
