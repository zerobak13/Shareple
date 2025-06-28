package com.example.Shareple.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ChatMessage {
    private String roomId;
    private String senderKakaoId;;
    private String content;
    private LocalDateTime timestamp;
}
