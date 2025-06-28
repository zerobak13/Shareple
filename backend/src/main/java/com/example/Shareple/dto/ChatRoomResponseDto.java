package com.example.Shareple.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatRoomResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    private String otherNickname;
    private String otherKakaoId;
}

