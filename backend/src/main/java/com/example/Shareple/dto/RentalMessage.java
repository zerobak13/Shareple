package com.example.Shareple.dto;


import lombok.Getter;
import lombok.Setter;




// 채팅에 흘릴 공통 메시지 (필요한 만큼만)


@Getter @Setter
public class RentalMessage {
    private String type;             // "RENTAL_PROPOSAL" | "RENTAL_UPDATE" | "SYSTEM"
    private Long roomId;
    private Long rentalId;
    private Long productId;

    private String productName;
    private String periodStart;      // "2025-08-10"
    private String periodEnd;
    private int deposit;

    private String status;           // "PENDING" | "ACTIVE" | "COMPLETED" | "REJECTED"
    private String text;             // 시스템 메시지용

    // 액션 버튼 힌트 (프론트가 이걸 보고 버튼을 그림)
    private String[] actions;        // e.g., ["ACCEPT", "REJECT"] 또는 ["COMPLETE"]
    private int completeProgress;    // 0,1,2 (완료버튼 누른 사람 수 표시용)
}
