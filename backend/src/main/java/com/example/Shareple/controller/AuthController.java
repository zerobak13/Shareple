package com.example.Shareple.controller;

import com.example.Shareple.dto.UserResponseDto;
import com.example.Shareple.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUser(@AuthenticationPrincipal OAuth2User oauth2User) {
        if (oauth2User == null) {
            return ResponseEntity.status(401).build();
        }

        String kakaoId = oauth2User.getAttribute("id").toString();
        UserResponseDto dto = userService.findByKakaoId(kakaoId)
                .map(user -> UserResponseDto.builder()
                        .id(user.getId())
                        .kakaoId(user.getKakaoId())
                        .nickname(user.getNickname())
                        .email(user.getEmail())
                        .profileImageUrl(user.getProfileImageUrl())
                        .name(user.getName())
                        .phone(user.getPhone())
                        .address(user.getAddress())
                        .build()
                )
                .orElse(null);

        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        request.getSession().invalidate(); //  세션 무효화
        return ResponseEntity.noContent().build();
    }
}
