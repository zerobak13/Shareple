package com.example.Shareple.controller;

import com.example.Shareple.dto.InquiryResponseDto;
import com.example.Shareple.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 관리자 전용 문의 관리 API.
 * 인증 자체는 SecurityConfig 의 "anyRequest authenticated" 로 처리하고,
 * 관리자 여부는 서비스 레이어의 requireAdmin 에서 체크한다.
 */
@RestController
@RequestMapping("/api/admin/inquiries")
@RequiredArgsConstructor
public class AdminInquiryController {

    private final InquiryService inquiryService;

    /** 전체/상태별 문의 목록 (OPEN | ANSWERED | ALL) */
    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal OAuth2User me,
                                  @RequestParam(value = "status", required = false) String status) {
        if (me == null) return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        try {
            String kakaoId = me.getAttribute("id").toString();
            List<InquiryResponseDto> list = inquiryService.adminList(kakaoId, status);
            return ResponseEntity.ok(list);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** 답변 등록 / 수정 */
    @PostMapping("/{id}/answer")
    public ResponseEntity<?> answer(@AuthenticationPrincipal OAuth2User me,
                                    @PathVariable("id") Long id,
                                    @RequestBody Map<String, String> body) {
        if (me == null) return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        try {
            String kakaoId = me.getAttribute("id").toString();
            String answer = body != null ? body.get("answer") : null;
            InquiryResponseDto updated = inquiryService.adminAnswer(kakaoId, id, answer);
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** OPEN 문의 건수 */
    @GetMapping("/open-count")
    public ResponseEntity<?> openCount(@AuthenticationPrincipal OAuth2User me) {
        if (me == null) return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        try {
            String kakaoId = me.getAttribute("id").toString();
            long count = inquiryService.adminOpenCount(kakaoId);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }
}
