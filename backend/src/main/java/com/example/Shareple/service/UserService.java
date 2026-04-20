// src/main/java/com/example/Shareple/service/UserService.java
package com.example.Shareple.service;

import com.example.Shareple.entity.User;
import com.example.Shareple.dto.UserRequestDto;
import com.example.Shareple.dto.UserResponseDto;
import com.example.Shareple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /** application.properties 의 app.admin-kakao-ids (쉼표 구분) */
    @Value("${app.admin-kakao-ids:}")
    private String adminKakaoIdsRaw;

    private Set<String> adminKakaoIds() {
        if (adminKakaoIdsRaw == null || adminKakaoIdsRaw.isBlank()) return Set.of();
        return Arrays.stream(adminKakaoIdsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(HashSet::new));
    }

    /** 현재 로그인 사용자 kakaoId 로 관리자 여부 확인 (서비스 레이어 권한 체크용) */
    public boolean isAdminKakaoId(String kakaoId) {
        if (kakaoId == null) return false;
        // 1) 설정 기반 즉시 승인
        if (adminKakaoIds().contains(kakaoId)) return true;
        // 2) DB role 기반
        return userRepository.findByKakaoId(kakaoId)
                .map(u -> u.getRole() == User.Role.ADMIN)
                .orElse(false);
    }

    public Optional<User> findByKakaoId(String kakaoId) {
        return userRepository.findByKakaoId(kakaoId);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserResponseDto createUser(UserRequestDto requestDto) {
        User user = User.builder()
                .kakaoId(requestDto.getKakaoId())
                .nickname(requestDto.getNickname())
                .email(requestDto.getEmail())
                .profileImageUrl(requestDto.getProfileImageUrl())
                .name(requestDto.getName())
                .phone(requestDto.getPhone())
                .address(requestDto.getAddress())
                .build();
        User saved = userRepository.save(user);
        return toResponseDto(saved);
    }

    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public Optional<UserResponseDto> getUserById(Long id) {
        return userRepository.findById(id).map(this::toResponseDto);
    }

    public Optional<UserResponseDto> updateUser(Long id, UserRequestDto requestDto) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setNickname(requestDto.getNickname());
                    user.setEmail(requestDto.getEmail());
                    user.setProfileImageUrl(requestDto.getProfileImageUrl());
                    user.setName(requestDto.getName());
                    user.setPhone(requestDto.getPhone());
                    user.setAddress(requestDto.getAddress());
                    User updated = userRepository.save(user);
                    return toResponseDto(updated);
                });
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

//    public UserResponseDto processOAuthPostLogin(String kakaoId,
//                                                 String nickname,
//                                                 String email,
//                                                 String profileImageUrl) {
//        Optional<User> existing = userRepository.findByKakaoId(kakaoId);
//        if (existing.isPresent()) {
//            return toResponseDto(existing.get());
//        }
//        User user = User.builder()
//                .kakaoId(kakaoId)
//                .nickname(nickname)
//                .email(email)
//                .profileImageUrl(profileImageUrl)
//                .name("")
//                .phone("")
//                .address("")
//                .build();
//        User saved = userRepository.save(user);
//        return toResponseDto(saved);
//    }
public UserResponseDto processOAuthPostLogin(String kakaoId,
                                             String nickname,         // 사용자가 입력할 별명 → 초기엔 공백
                                             String email,
                                             String profileImageUrl,
                                             String name) {           // 카카오 닉네임
    boolean adminByConfig = adminKakaoIds().contains(kakaoId);

    Optional<User> existing = userRepository.findByKakaoId(kakaoId);
    if (existing.isPresent()) {
        // 기존 사용자: 설정 기반 관리자 목록에 있으면 role 을 ADMIN 으로 동기화
        User u = existing.get();
        if (adminByConfig && u.getRole() != User.Role.ADMIN) {
            u.setRole(User.Role.ADMIN);
            userRepository.save(u);
        }
        return toResponseDto(u);
    }
    User user = User.builder()
            .kakaoId(kakaoId)
            .nickname(nickname)      // ➡️ 공백
            .email(email)
            .profileImageUrl(profileImageUrl)
            .name(name)              // ➡️ 카카오 닉네임 저장
            .phone("")
            .address("")
            .role(adminByConfig ? User.Role.ADMIN : User.Role.USER)
            .build();
    User saved = userRepository.save(user);
    return toResponseDto(saved);
}

    private UserResponseDto toResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .kakaoId(user.getKakaoId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .profileImageUrl(user.getProfileImageUrl())
                .name(user.getName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .role(user.getRole() != null ? user.getRole().name() : User.Role.USER.name())
                .build();
    }
}
