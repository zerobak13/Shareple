package com.example.Shareple.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.Shareple.entity.ChatMessageEntity;
import java.util.List;
import java.util.Optional;


public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findByRoomIdOrderByTimestampAsc(String roomId);

    /** 채팅방의 마지막 메시지 1건 (목록에 미리보기용) */
    Optional<ChatMessageEntity> findTopByRoomIdOrderByTimestampDesc(String roomId);
}
