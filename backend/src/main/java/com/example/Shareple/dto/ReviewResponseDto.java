package com.example.Shareple.dto;

import com.example.Shareple.entity.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private Long id;
    private Long rentalId;

    private Long productId;
    private String productName;
    private String productImageUrl;

    private Long reviewerId;
    private String reviewerNickname;
    private String reviewerProfileImageUrl;

    private Long revieweeId;
    private String revieweeNickname;

    private int rating;
    private String content;
    private LocalDateTime createdAt;

    public static ReviewResponseDto from(Review r) {
        return ReviewResponseDto.builder()
                .id(r.getId())
                .rentalId(r.getRental() != null ? r.getRental().getId() : null)
                .productId(r.getProduct() != null ? r.getProduct().getId() : null)
                .productName(r.getProduct() != null ? r.getProduct().getName() : null)
                .productImageUrl(r.getProduct() != null ? r.getProduct().getImageUrl() : null)
                .reviewerId(r.getReviewer() != null ? r.getReviewer().getId() : null)
                .reviewerNickname(r.getReviewer() != null ? r.getReviewer().getNickname() : null)
                .reviewerProfileImageUrl(r.getReviewer() != null ? r.getReviewer().getProfileImageUrl() : null)
                .revieweeId(r.getReviewee() != null ? r.getReviewee().getId() : null)
                .revieweeNickname(r.getReviewee() != null ? r.getReviewee().getNickname() : null)
                .rating(r.getRating())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
