package com.example.Shareple.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Shareple.entity.ChatMessageEntity;
import java.util.List;


public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findByRoomIdOrderByTimestampAsc(String roomId);
}
