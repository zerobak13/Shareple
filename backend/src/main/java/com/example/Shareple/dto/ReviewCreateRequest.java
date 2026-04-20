package com.example.Shareple.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 리뷰 작성 요청 바디.
 *  - rentalId : 완료된 거래 id
 *  - rating   : 1~5
 *  - content  : 본문
 * reviewer 는 인증 세션에서, reviewee / product 는 rental 에서 자동 결정한다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewCreateRequest {
    private Long rentalId;
    private int rating;
    private String content;
}
