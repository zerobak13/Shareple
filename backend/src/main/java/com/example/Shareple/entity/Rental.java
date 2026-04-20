package com.example.Shareple.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
public class Rental {

    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_room_id")
    private ChatRoom chatRoom;

    @ManyToOne(fetch = FetchType.LAZY)
    private Product product; // 빌리는 상품

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;      // 물건 주인

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id")
    private User borrower;   // 빌리는 사람

    private LocalDate startDate; // 대여 시작일
    private LocalDate endDate;   // 대여 종료일

    private int deposit;         // 보증금

    @Enumerated(EnumType.STRING)
    private RentalStatus status = RentalStatus.PENDING;

    private boolean ownerCompleted = false;    // 주인 완료 버튼 여부
    private boolean borrowerCompleted = false; // 빌리는 사람 완료 버튼 여부
}
