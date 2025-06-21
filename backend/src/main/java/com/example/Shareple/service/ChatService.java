// src/main/java/com/example/Shareple/service/ChatService.java
package com.example.Shareple.service;

import com.example.Shareple.entity.ChatRoom;
import com.example.Shareple.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;

    public ChatRoom createOrGetChatRoom(String senderKakaoId, String receiverKakaoId) {
        Optional<ChatRoom> existingRoom = chatRoomRepository.findBySenderKakaoIdAndReceiverKakaoId(senderKakaoId, receiverKakaoId);
        return existingRoom.orElseGet(() -> {
            ChatRoom newRoom = ChatRoom.builder()
                    .senderKakaoId(senderKakaoId)
                    .receiverKakaoId(receiverKakaoId)
                    .build();
            return chatRoomRepository.save(newRoom);
        });
    }
}
