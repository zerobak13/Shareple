package com.example.Shareple.repository;

import com.example.Shareple.entity.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findBySenderKakaoIdAndReceiverKakaoId(String sender, String receiver);
    Optional<ChatRoom> findByReceiverKakaoIdAndSenderKakaoId(String receiver, String sender);
}
