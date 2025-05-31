// src/main/java/com/example/Shareple/service/UserService.java
package com.example.Shareple.service;

import com.example.Shareple.domain.User;
import com.example.Shareple.dto.UserRequestDto;
import com.example.Shareple.dto.UserResponseDto;
import com.example.Shareple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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

    public UserResponseDto processOAuthPostLogin(String kakaoId,
                                                 String nickname,
                                                 String email,
                                                 String profileImageUrl) {
        Optional<User> existing = userRepository.findByKakaoId(kakaoId);
        if (existing.isPresent()) {
            return toResponseDto(existing.get());
        }
        User user = User.builder()
                .kakaoId(kakaoId)
                .nickname(nickname)
                .email(email)
                .profileImageUrl(profileImageUrl)
                .name("")
                .phone("")
                .address("")
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
                .build();
    }
}
