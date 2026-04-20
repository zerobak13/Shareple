package com.example.Shareple.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자/상품의 리뷰 요약 (갯수·평균 평점).
 * 프론트 MyPageHome / ProductDetail 에 표시.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingSummaryDto {
    private long count;
    private double average; // 0.0 ~ 5.0, 소수 1자리 반올림
}
