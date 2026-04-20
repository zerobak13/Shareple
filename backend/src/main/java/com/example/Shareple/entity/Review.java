package com.example.Shareple.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * 거래(Rental) 완료 후 양쪽 참여자가 서로에게 남기는 후기.
 * 하나의 rental 당 reviewer 1명이 최대 1개의 리뷰를 남긴다.
 */
@Entity
@Table(
        name = "review",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uq_review_rental_reviewer",
                        columnNames = {"rental_id", "reviewer_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 거래에 대한 리뷰인지 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rental_id")
    private Rental rental;

    /** 상품 (빠른 상품별 조회용) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    /** 리뷰 작성자 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    /** 리뷰 대상 (상대 참여자) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewee_id")
    private User reviewee;

    /** 1~5 */
    @Column(nullable = false)
    private int rating;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
