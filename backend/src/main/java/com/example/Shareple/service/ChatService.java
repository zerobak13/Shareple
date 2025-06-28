// src/main/java/com/example/Shareple/service/ChatService.java
package com.example.Shareple.service;

import com.example.Shareple.entity.ChatRoom;
import com.example.Shareple.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.Shareple.dto.ChatRoomResponseDto;
import com.example.Shareple.domain.User;
import com.example.Shareple.entity.Product;

import java.util.Optional;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import com.example.Shareple.repository.ProductRepository;
import com.example.Shareple.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRoomRepository chatRoomRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
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

                String opponentKakaoId = myKakaoId.equals(room.getSenderKakaoId()) ?
                        room.getReceiverKakaoId() : room.getSenderKakaoId();

                User opponent = userRepository.findByKakaoId(opponentKakaoId).orElse(null);
                if (opponent == null) {
                    System.out.println("❌ 상대방 정보를 찾을 수 없습니다. kakaoId: " + opponentKakaoId);
                }
                String opponentNickname = opponent != null ? opponent.getNickname() : "알 수 없음";

                return new ChatRoomResponseDto(
                        room.getId(),
                        room.getProductId(),
                        productName,
                        opponentNickname,
                        opponentKakaoId
                );
            } catch (Exception e) {
                System.out.println("❌ ChatRoomResponseDto 생성 중 오류: " + e.getMessage());
                return null;
            }
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

}
