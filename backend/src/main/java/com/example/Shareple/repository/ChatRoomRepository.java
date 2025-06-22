package com.example.Shareple.repository;

import com.example.Shareple.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findBySenderKakaoIdAndReceiverKakaoIdAndProductId(String sender, String receiver, Long productId);
    Optional<ChatRoom> findByReceiverKakaoIdAndSenderKakaoIdAndProductId(String receiver, String sender, Long productId);
}

