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

    @MessageMapping("/chat/{roomId}")  // 클라이언트에서 보낼 때 destination: "/app/chat/{roomId}"
    public void handleChatMessage(@DestinationVariable String roomId, ChatMessage message) {
        // DB 저장
        ChatMessageEntity entity = ChatMessageEntity.builder()
                .roomId(roomId)
                .sender(message.getSenderKakaoId())
                .content(message.getContent())
                .timestamp(LocalDateTime.now())
                .build();
        chatMessageRepository.save(entity);
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);  // 클라이언트는 "/topic/chat/{roomId}"를 구독
    }





}
