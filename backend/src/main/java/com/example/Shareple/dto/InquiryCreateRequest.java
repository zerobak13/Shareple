package com.example.Shareple.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 고객 문의 작성 요청 바디.
 *  - title   : 제목
 *  - content : 본문
 * 작성자는 인증 세션에서 자동 결정한다.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryCreateRequest {
    private String title;
    private String content;
}
