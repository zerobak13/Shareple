// ChatMessageEntity.java
package com.example.Shareple.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "chat_message_entity")
public class ChatMessageEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)  // ✅ MySQL auto_increment 사용
    private Long id;

    @Column(nullable = false, length = 64)
    private String roomId;

    @Column(length = 64)
    private String senderKakaoId;       // USER는 카카오ID, SYSTEM은 "SYSTEM"

    @Column(columnDefinition = "TEXT")
    private String content;             // 사람이 읽을 요약/일반 채팅 텍스트

    // 사진 메시지일 경우 업로드된 이미지 URL (/uploads/...). 텍스트만이면 null
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    private LocalDateTime timestamp;

    // USER | SYSTEM  (DB에 이미 type 컬럼이 있으면 이름을 바꾸지 마세요)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private String type = "USER";

    // TEXT | RENTAL 등 내부 구분용 (DB 컬럼명이 msg_type 인 경우 이름 고정)
    @Builder.Default
    @Column(name = "msg_type", nullable = false, length = 20)
    private String msgType = "TEXT";

    // 거래 전체 페이로드 JSON (MySQL 5.x면 LONGTEXT, 8.x면 JSON도 가능)
    @Column(name = "payload_json", columnDefinition = "LONGTEXT")
    private String payloadJson;
}
