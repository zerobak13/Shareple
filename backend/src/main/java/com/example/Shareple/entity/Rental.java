package com.example.Shareple.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Rental {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String kakaoId; // 임차인 (로그인한 사용자)
    private String ownerName; // 임대인 이름
    private String title;     // 상품명
    private String status;    // 대여중, 반납완료
    private int price;

    private String startDate;
    private String endDate;
}
