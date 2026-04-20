// src/main/java/com/example/Shareple/service/ChatService.java
package com.example.Shareple.service;

import com.example.Shareple.dto.ChatRoomResponseDto;
import com.example.Shareple.entity.ChatMessageEntity;
import com.example.Shareple.entity.ChatRoom;
import com.example.Shareple.entity.Product;
import com.example.Shareple.entity.User;
import com.example.Shareple.repository.ChatMessageRepository;
import com.example.Shareple.repository.ChatRoomRepository;
import com.example.Shareple.repository.ProductRepository;
import com.example.Shareple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ChatRoom createOrGetChatRoom(String senderKakaoId, String receiverKakaoId, Long productId) {
        // 1. sender → receiver 방향 확인
        Optional<ChatRoom> room1 = chatRoomRepository
                .findBySenderKakaoIdAndReceiverKakaoIdAndProductId(senderKakaoId, receiverKakaoId, productId);
        if (room1.isPresent()) return room1.get();

        // 2. receiver → sender 방향 확인
        Optional<ChatRoom> room2 = chatRoomRepository
                .findBySenderKakaoIdAndReceiverKakaoIdAndProductId(receiverKakaoId, senderKakaoId, productId);
        if (room2.isPresent()) return room2.get();

        // 3. 없으면 새로 생성
        ChatRoom newRoom = ChatRoom.builder()
                .senderKakaoId(senderKakaoId)
                .receiverKakaoId(receiverKakaoId)
                .productId(productId)
                .build();
        return chatRoomRepository.save(newRoom);
    }

    public List<ChatRoomResponseDto> getMyChatRooms(String myKakaoId) {
        List<ChatRoom> rooms = chatRoomRepository.findBySenderKakaoIdOrReceiverKakaoId(myKakaoId, myKakaoId);

        return rooms.stream().map(room -> {
            try {
                Product product = productRepository.findById(room.getProductId()).orElse(null);
                if (product == null) {
                    System.out.println("❌ 상품 정보를 찾을 수 없습니다. productId: " + room.getProductId());
                }
                String productName = product != null ? product.getName() : "알 수 없음";
                String productImageUrl = product != null ? product.getImageUrl() : null;

                String opponentKakaoId = myKakaoId.equals(room.getSenderKakaoId())
                        ? room.getReceiverKakaoId() : room.getSenderKakaoId();

                User opponent = userRepository.findByKakaoId(opponentKakaoId).orElse(null);
                if (opponent == null) {
                    System.out.println("❌ 상대방 정보를 찾을 수 없습니다. kakaoId: " + opponentKakaoId);
                }
                String opponentNickname = opponent != null ? opponent.getNickname() : "알 수 없음";

                // 마지막 메시지 미리보기 (사진 메시지는 본문이 비어있을 수 있음)
                Optional<ChatMessageEntity> lastOpt =
                        chatMessageRepository.findTopByRoomIdOrderByTimestampDesc(String.valueOf(room.getId()));

                String lastMessage = null;
                LocalDateTime lastMessageAt = null;
                if (lastOpt.isPresent()) {
                    ChatMessageEntity last = lastOpt.get();
                    lastMessageAt = last.getTimestamp();
                    if ("SYSTEM".equals(last.getType())) {
                        lastMessage = last.getContent() != null ? last.getContent() : "[거래 메시지]";
                    } else if (last.getImageUrl() != null && !last.getImageUrl().isBlank()) {
                        lastMessage = "사진을 보냈습니다";
                    } else {
                        lastMessage = last.getContent();
                    }
                }

                return ChatRoomResponseDto.builder()
                        .id(room.getId())
                        .productId(room.getProductId())
                        .productName(productName)
                        .productImageUrl(productImageUrl)
                        .otherNickname(opponentNickname)
                        .otherKakaoId(opponentKakaoId)
                        .lastMessage(lastMessage)
                        .lastMessageAt(lastMessageAt)
                        .build();
            } catch (Exception e) {
                System.out.println("❌ ChatRoomResponseDto 생성 중 오류: " + e.getMessage());
                return null;
            }
        })
        .filter(Objects::nonNull)
        // 최근 메시지가 있는 방을 위로, 없으면 뒤로
        .sorted(Comparator.comparing(
                ChatRoomResponseDto::getLastMessageAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ))
        .collect(Collectors.toList());
    }
}
