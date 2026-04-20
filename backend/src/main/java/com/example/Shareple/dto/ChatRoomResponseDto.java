package com.example.Shareple.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomResponseDto {
    private Long id;
    private Long productId;
    private String productName;
    /** 상품 대표 이미지 URL (목록에서 썸네일로 사용) */
    private String productImageUrl;
    private String otherNickname;
    private String otherKakaoId;
    /** 마지막 메시지 미리보기 (사진이면 "사진을 보냈습니다") */
    private String lastMessage;
    /** 마지막 메시지 시각 (없으면 null) */
    private LocalDateTime lastMessageAt;
}
