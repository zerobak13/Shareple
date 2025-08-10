package com.example.Shareple.controller;
import com.example.Shareple.entity.ChatMessageEntity;
import com.example.Shareple.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import com.example.Shareple.entity.ChatRoom;
import com.example.Shareple.repository.ChatRoomRepository;
import com.example.Shareple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import com.example.Shareple.dto.ChatRoomRequestDto;
import java.util.List;
import com.example.Shareple.repository.ChatMessageRepository; // import 먼저
import com.example.Shareple.dto.ChatRoomResponseDto;
import com.example.Shareple.service.ChatService;
import java.util.Map;
import com.example.Shareple.entity.Product;
import com.example.Shareple.entity.User;
import java.util.HashMap;



import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatService chatService;

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @PostMapping("/create")
    public ChatRoom createChatRoom(@AuthenticationPrincipal OAuth2User user,
                                   @RequestBody ChatRoomRequestDto requestDto) {
        String senderKakaoId = user.getAttribute("id").toString();
        String receiverKakaoId = requestDto.getReceiverKakaoId();
        Long productId = requestDto.getProductId();

        // 완전히 일치하는 경우만 조회
        Optional<ChatRoom> existingRoom = chatRoomRepository
                .findBySenderKakaoIdAndReceiverKakaoIdAndProductId(senderKakaoId, receiverKakaoId, productId);

        // 있으면 재사용
        if (existingRoom.isPresent()) return existingRoom.get();

        // 없으면 새로 생성
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

//    // ✅ 내 채팅방 목록 조회 (판매자 입장에서)
//    @GetMapping("/my-chat-rooms")
//    public List<ChatRoom> getMyChatRooms(@AuthenticationPrincipal OAuth2User user) {
//        String myKakaoId = user.getAttribute("id").toString();
//        return chatRoomRepository.findByReceiverKakaoId(myKakaoId);
//    }

    @GetMapping("/all-my-chat-rooms")
    public List<ChatRoom> getAllMyChatRooms(@AuthenticationPrincipal OAuth2User user) {
        String myKakaoId = user.getAttribute("id").toString();
        return chatRoomRepository.findBySenderKakaoIdOrReceiverKakaoId(myKakaoId, myKakaoId);
    }
    @GetMapping("/my-chat-rooms")
    public ResponseEntity<List<ChatRoomResponseDto>> getMyChatRooms(@AuthenticationPrincipal OAuth2User oauth2User) {
        String myKakaoId = oauth2User.getAttribute("id").toString();
        List<ChatRoomResponseDto> rooms = chatService.getMyChatRooms(myKakaoId);
        return ResponseEntity.ok(rooms);
    }

    // ✅ 방 메타 조회 API
    @GetMapping("/rooms/{roomId}")
    public ResponseEntity<Map<String, Object>> getRoomMeta(
            @PathVariable Long roomId,
            @AuthenticationPrincipal OAuth2User me
    ) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("채팅방 없음"));

        Product product = productRepository.findById(room.getProductId())
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        // 방의 두 참여자
        String senderKakaoId = room.getSenderKakaoId();
        String receiverKakaoId = room.getReceiverKakaoId();

        // 상품 등록자(주인) = product.kakaoId
        String ownerKakaoId = product.getKakaoId();
        String otherKakaoId = ownerKakaoId.equals(senderKakaoId) ? receiverKakaoId : senderKakaoId;

        // (선택) userId도 내려주자: 프론트가 borrowerId로 user PK를 써야 할 때 유용
        Long ownerUserId = userRepository.findByKakaoId(ownerKakaoId).map(User::getId).orElse(null);
        Long otherUserId = userRepository.findByKakaoId(otherKakaoId).map(User::getId).orElse(null);

        Map<String, Object> resp = new HashMap<>();
        resp.put("roomId", roomId);
        resp.put("productId", product.getId());
        resp.put("ownerKakaoId", ownerKakaoId);
        resp.put("otherKakaoId", otherKakaoId);
        resp.put("ownerUserId", ownerUserId);
        resp.put("otherUserId", otherUserId);
        return ResponseEntity.ok(resp);
    }



}
