package com.example.Shareple.controller;

import com.example.Shareple.entity.ChatRoom;
import com.example.Shareple.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import com.example.Shareple.dto.ChatRoomRequestDto;


import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatRoomRepository chatRoomRepository;

    @PostMapping("/create")
    public ChatRoom createChatRoom(@AuthenticationPrincipal OAuth2User user,
                                   @RequestBody ChatRoomRequestDto requestDto) {

        String senderKakaoId = user.getAttribute("id").toString();
        String receiverKakaoId = requestDto.getReceiverKakaoId();

        // 중복 방 방지 (양방향 확인)
        Optional<ChatRoom> existingRoom = chatRoomRepository
                .findBySenderKakaoIdAndReceiverKakaoId(senderKakaoId, receiverKakaoId);

        if (existingRoom.isPresent()) {
            return existingRoom.get();
        }

        Optional<ChatRoom> reverseRoom = chatRoomRepository
                .findByReceiverKakaoIdAndSenderKakaoId(senderKakaoId, receiverKakaoId);

        if (reverseRoom.isPresent()) {
            return reverseRoom.get();
        }

        // 새 방 생성
        ChatRoom room = ChatRoom.builder()
                .senderKakaoId(senderKakaoId)
                .receiverKakaoId(receiverKakaoId)
                .build();

        return chatRoomRepository.save(room);
    }
}
