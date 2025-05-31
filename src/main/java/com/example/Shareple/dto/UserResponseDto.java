// src/main/java/com/example/Shareple/dto/UserResponseDto.java
package com.example.Shareple.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDto {
    private Long id;
    private String kakaoId;
    private String nickname;
    private String email;
    private String profileImageUrl;
    private String name;
    private String phone;
    private String address;
}
