package com.example.Shareple.controller;
import com.example.Shareple.entity.ChatMessageEntity;
import java.time.LocalDateTime;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.Shareple.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import com.example.Shareple.repository.ChatMessageRepository;
import org.springframework.messaging.handler.annotation.SendTo;

@RequiredArgsConstructor
@Controller
public class WebSocketChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageRepository chatMessageRepository;

    @MessageMapping("/chat/{roomId}")
    public void handleChatMessage(@DestinationVariable String roomId, ChatMessage message) {
        // 현재 시간 생성
        LocalDateTime now = LocalDateTime.now();

        // DB에 저장
        ChatMessageEntity entity = ChatMessageEntity.builder()
                .roomId(roomId)
                .senderKakaoId(message.getSenderKakaoId())
                .content(message.getContent())
                .timestamp(now)
                .build();
        chatMessageRepository.save(entity);

        // 프론트에 보낼 응답 메시지 객체 따로 생성
        ChatMessage response = new ChatMessage();
        response.setRoomId(roomId);
        response.setSenderKakaoId(message.getSenderKakaoId());  // ✅ 필드명 일치
        response.setContent(message.getContent());
        response.setTimestamp(now);  // ✅ 시간 포함

        // WebSocket 전송
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, response);
    }






}
