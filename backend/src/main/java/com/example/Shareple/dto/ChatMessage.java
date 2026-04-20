package com.example.Shareple.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessage {
    private String roomId;
    private String senderKakaoId;
    private String content;
    /** 사진 전송 시 업로드 후 얻은 이미지 URL (/uploads/...). 일반 텍스트 메시지에서는 null */
    private String imageUrl;
    private LocalDateTime timestamp;
}
