// 수정된 파일: Shareple/src/main/java/com/example/Shareple/config/SecurityConfig.java
package com.example.Shareple.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Security 설정 파일
 */
@Configuration
public class SecurityConfig {

    // ① 필드 타입을 OAuth2UserService<OAuth2UserRequest, OAuth2User> 로 지정
    private final OAuth2UserService<org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest, OAuth2User> customOAuth2UserService;

    /**
     * 생성자 주입
     * (Param 타입이 OAuth2UserService<OAuth2UserRequest, OAuth2User> 이므로 오류가 사라집니다)
     */
    public SecurityConfig(
            OAuth2UserService<org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest, OAuth2User> customOAuth2UserService
    ) {
        this.customOAuth2UserService = customOAuth2UserService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 (REST API 용도)
                .csrf(csrf -> csrf.disable())

                // 세션 생성 정책 (필요 시 변경 가능)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                // URL 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // /api/auth/** (로그인, 현재 사용자 정보) 및 H2 콘솔 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        // 그 외 요청은 인증 필요
                        .anyRequest().authenticated()
                )

                // OAuth2 로그인 설정
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                // ② userService에 주입되는 빈의 타입이 맞춰졌으므로 오류가 없어집니다
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(this::oauth2LoginSuccessHandler)
                        .failureHandler(this::oauth2LoginFailureHandler)
                )

                // H2 콘솔을 iframe으로 보기 위해 frameOptions 비활성화 (개발용)
                .headers(headers -> headers.frameOptions(frame -> frame.disable()));

        return http.build();
    }

    /**
     * OAuth2 로그인 성공 후 호출되는 핸들러
     * - CustomOAuth2UserService 에서 이미 DB 저장을 마친 상태이므로
     *   여기는 단순히 "/api/auth/me" 로 Redirect만 해줍니다.
     */
    private void oauth2LoginSuccessHandler(
            HttpServletRequest request,
            HttpServletResponse response,
            org.springframework.security.core.Authentication authentication
    ) throws IOException, ServletException {
        response.sendRedirect("/api/auth/me");
    }

    /**
     * OAuth2 로그인 실패 시 호출되는 핸들러
     */
    private void oauth2LoginFailureHandler(
            HttpServletRequest request,
            HttpServletResponse response,
            org.springframework.security.core.AuthenticationException exception
    ) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("OAuth2 Login Failed: " + exception.getMessage());
    }
}
