package com.example.Shareple.entity;

public enum RentalStatus {
    PENDING,    // 거래 제안됨(수락/거절 대기)
    ACTIVE,     // 대여중
    COMPLETED,  // 거래 완료
    REJECTED    // 거래 거절됨
}
