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

    public ChatRoom createOrGetChatRoom(String senderKakaoId, String receiverKakaoId, Long productId) {
        // 양방향으로 기존 채팅방 확인
        Optional<ChatRoom> existingRoom = chatRoomRepository
                .findBySenderKakaoIdAndReceiverKakaoIdAndProductId(senderKakaoId, receiverKakaoId, productId);

        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }

        // 혹시 sender/receiver가 바뀌었을 경우
        existingRoom = chatRoomRepository
                .findByReceiverKakaoIdAndSenderKakaoIdAndProductId(senderKakaoId, receiverKakaoId, productId);

        return existingRoom.orElseGet(() -> {
            ChatRoom newRoom = ChatRoom.builder()
                    .senderKakaoId(senderKakaoId)
                    .receiverKakaoId(receiverKakaoId)
                    .productId(productId)
                    .build();
            return chatRoomRepository.save(newRoom);
        });
    }
}
