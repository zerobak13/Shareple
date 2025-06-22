package com.example.Shareple.controller;
import com.example.Shareple.entity.ChatMessageEntity;

import com.example.Shareple.entity.ChatRoom;
import com.example.Shareple.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import com.example.Shareple.dto.ChatRoomRequestDto;
import java.util.List;
import com.example.Shareple.repository.ChatMessageRepository; // import 먼저


import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    @PostMapping("/create")
    public ChatRoom createChatRoom(@AuthenticationPrincipal OAuth2User user,
                                   @RequestBody ChatRoomRequestDto requestDto) {
        String senderKakaoId = user.getAttribute("id").toString();
        String receiverKakaoId = requestDto.getReceiverKakaoId();
        Long productId = requestDto.getProductId();

        // 기존 채팅방 있는지 확인 (양방향)
        Optional<ChatRoom> existingRoom = chatRoomRepository
                .findBySenderKakaoIdAndReceiverKakaoIdAndProductId(senderKakaoId, receiverKakaoId, productId);

        if (existingRoom.isPresent()) return existingRoom.get();

        Optional<ChatRoom> reverseRoom = chatRoomRepository
                .findByReceiverKakaoIdAndSenderKakaoIdAndProductId(senderKakaoId, receiverKakaoId, productId);

        if (reverseRoom.isPresent()) return reverseRoom.get();

        // 새로 생성
        ChatRoom room = ChatRoom.builder()
                .senderKakaoId(senderKakaoId)
                .receiverKakaoId(receiverKakaoId)
                .productId(productId)
                .build();

        return chatRoomRepository.save(room);
    }


    // ✅ 채팅 메시지 조회 API
    @GetMapping("/messages/{roomId}")
    public List<ChatMessageEntity> getMessages(@PathVariable String roomId) {
        return chatMessageRepository.findByRoomIdOrderByTimestampAsc(roomId);
    }
}
