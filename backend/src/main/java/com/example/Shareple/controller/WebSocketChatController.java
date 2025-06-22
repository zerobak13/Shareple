package com.example.Shareple.websocket;

import com.example.Shareple.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@RequiredArgsConstructor
@Controller
public class WebSocketChatController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{roomId}")  // 클라이언트에서 보낼 때 destination: "/app/chat/{roomId}"
    public void handleChatMessage(@DestinationVariable String roomId, ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/chat/" + roomId, message);  // 클라이언트는 "/topic/chat/{roomId}"를 구독
    }
}
