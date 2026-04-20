package com.example.Shareple.service;

import com.example.Shareple.dto.InquiryCreateRequest;
import com.example.Shareple.dto.InquiryResponseDto;
import com.example.Shareple.entity.Inquiry;
import com.example.Shareple.entity.User;
import com.example.Shareple.repository.InquiryRepository;
import com.example.Shareple.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public InquiryResponseDto create(String kakaoId, InquiryCreateRequest req) {
        if (req == null) throw new IllegalArgumentException("요청이 비어있습니다.");
        String title = req.getTitle() == null ? "" : req.getTitle().trim();
        String content = req.getContent() == null ? "" : req.getContent().trim();
        if (title.isEmpty()) throw new IllegalArgumentException("제목을 입력해주세요.");
        if (content.isEmpty()) throw new IllegalArgumentException("문의 내용을 입력해주세요.");
        if (title.length() > 200) throw new IllegalArgumentException("제목은 200자 이내여야 합니다.");

        User user = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Inquiry saved = inquiryRepository.save(Inquiry.builder()
                .user(user)
                .title(title)
                .content(content)
                .status(Inquiry.Status.OPEN)
                .build());

        return InquiryResponseDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<InquiryResponseDto> myInquiries(String kakaoId) {
        User me = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
        return inquiryRepository.findByUser_IdOrderByCreatedAtDesc(me.getId())
                .stream().map(InquiryResponseDto::from).collect(Collectors.toList());
    }

    /* ===================== 관리자 전용 ===================== */

    private void requireAdmin(String kakaoId) {
        if (!userService.isAdminKakaoId(kakaoId)) {
            throw new SecurityException("관리자 권한이 필요합니다.");
        }
    }

    /**
     * 관리자: 전체/상태별 문의 목록.
     * @param status "OPEN" / "ANSWERED" / null (전체)
     */
    @Transactional(readOnly = true)
    public List<InquiryResponseDto> adminList(String adminKakaoId, String status) {
        requireAdmin(adminKakaoId);
        List<Inquiry> rows;
        if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) {
            rows = inquiryRepository.findAllByOrderByCreatedAtDesc();
        } else {
            Inquiry.Status parsed;
            try {
                parsed = Inquiry.Status.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("알 수 없는 status: " + status);
            }
            rows = inquiryRepository.findByStatusOrderByCreatedAtDesc(parsed);
        }
        return rows.stream().map(InquiryResponseDto::from).collect(Collectors.toList());
    }

    /** 관리자: 답변 등록/수정. 답변이 비어있지 않으면 status=ANSWERED, answeredAt=now. */
    @Transactional
    public InquiryResponseDto adminAnswer(String adminKakaoId, Long inquiryId, String answer) {
        requireAdmin(adminKakaoId);
        String trimmed = answer == null ? "" : answer.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("답변 내용을 입력해주세요.");
        }
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new IllegalArgumentException("문의를 찾을 수 없습니다."));
        inquiry.setAnswer(trimmed);
        inquiry.setStatus(Inquiry.Status.ANSWERED);
        inquiry.setAnsweredAt(LocalDateTime.now());
        // JPA dirty checking 으로 자동 UPDATE
        return InquiryResponseDto.from(inquiry);
    }

    /** 관리자: OPEN 문의 개수 (대시보드용 확장 여지) */
    @Transactional(readOnly = true)
    public long adminOpenCount(String adminKakaoId) {
        requireAdmin(adminKakaoId);
        return inquiryRepository.countByStatus(Inquiry.Status.OPEN);
    }
}
