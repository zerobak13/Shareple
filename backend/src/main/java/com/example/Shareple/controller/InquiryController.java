package com.example.Shareple.controller;

import com.example.Shareple.dto.InquiryCreateRequest;
import com.example.Shareple.dto.InquiryResponseDto;
import com.example.Shareple.service.InquiryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    /** 문의 접수 */
    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal OAuth2User me,
                                    @RequestBody InquiryCreateRequest req) {
        if (me == null) return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        try {
            String kakaoId = me.getAttribute("id").toString();
            InquiryResponseDto created = inquiryService.create(kakaoId, req);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** 내 문의 목록 */
    @GetMapping("/my")
    public List<InquiryResponseDto> my(@AuthenticationPrincipal OAuth2User me) {
        if (me == null) return List.of();
        String kakaoId = me.getAttribute("id").toString();
        return inquiryService.myInquiries(kakaoId);
    }
}
