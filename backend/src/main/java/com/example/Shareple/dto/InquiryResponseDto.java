package com.example.Shareple.dto;

import com.example.Shareple.entity.Inquiry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InquiryResponseDto {
    private Long id;

    private Long userId;
    private String userNickname;

    private String title;
    private String content;

    /** OPEN | ANSWERED */
    private String status;
    private String answer;

    private LocalDateTime createdAt;
    private LocalDateTime answeredAt;

    public static InquiryResponseDto from(Inquiry i) {
        return InquiryResponseDto.builder()
                .id(i.getId())
                .userId(i.getUser() != null ? i.getUser().getId() : null)
                .userNickname(i.getUser() != null ? i.getUser().getNickname() : null)
                .title(i.getTitle())
                .content(i.getContent())
                .status(i.getStatus() != null ? i.getStatus().name() : null)
                .answer(i.getAnswer())
                .createdAt(i.getCreatedAt())
                .answeredAt(i.getAnsweredAt())
                .build();
    }
}
