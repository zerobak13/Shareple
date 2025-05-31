// src/main/java/com/example/Shareple/dto/UserRequestDto.java
package com.example.Shareple.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDto {
    private String kakaoId;
    private String nickname;
    private String email;
    private String profileImageUrl;
    private String name;
    private String phone;
    private String address;
}
