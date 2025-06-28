package com.example.Shareple.repository;

import com.example.Shareple.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findBySenderKakaoIdAndReceiverKakaoIdAndProductId(String senderKakaoId, String receiverKakaoId, Long productId);
    Optional<ChatRoom> findByReceiverKakaoIdAndSenderKakaoIdAndProductId(String receiverKakaoId, String senderKakaoId, Long productId);

    // ✅ 판매자(내가 receiver일 때)의 모든 채팅방 목록 가져오기
    List<ChatRoom> findByReceiverKakaoId(String receiverKakaoId);

    // ✅ 또는, 내가 참여한 모든 채팅방 목록 가져오기 (판매자 + 구매자)
    List<ChatRoom> findBySenderKakaoIdOrReceiverKakaoId(String senderKakaoId, String receiverKakaoId);
}

