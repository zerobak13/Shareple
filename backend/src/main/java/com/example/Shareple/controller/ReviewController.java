package com.example.Shareple.controller;

import com.example.Shareple.dto.RatingSummaryDto;
import com.example.Shareple.dto.ReviewCreateRequest;
import com.example.Shareple.dto.ReviewResponseDto;
import com.example.Shareple.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /** 리뷰 작성 (완료된 거래의 참여자만) */
    @PostMapping
    public ResponseEntity<?> write(@AuthenticationPrincipal OAuth2User me,
                                   @RequestBody ReviewCreateRequest req) {
        if (me == null) return ResponseEntity.status(401).body(Map.of("error", "로그인이 필요합니다."));
        try {
            String kakaoId = me.getAttribute("id").toString();
            ReviewResponseDto created = reviewService.writeReview(kakaoId, req);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** 특정 rental 에 대해 내가 이미 리뷰를 썼는지 */
    @GetMapping("/exists/rental/{rentalId}")
    public Map<String, Boolean> existsForRental(@AuthenticationPrincipal OAuth2User me,
                                                @PathVariable Long rentalId) {
        boolean exists = false;
        if (me != null) {
            String kakaoId = me.getAttribute("id").toString();
            exists = reviewService.existsForRental(kakaoId, rentalId);
        }
        return Map.of("exists", exists);
    }

    /** 마이페이지: 내가 작성한 / 내가 받은 리뷰 */
    @GetMapping("/my")
    public List<ReviewResponseDto> my(@AuthenticationPrincipal OAuth2User me,
                                      @RequestParam(defaultValue = "written") String type) {
        if (me == null) return List.of();
        String kakaoId = me.getAttribute("id").toString();
        if ("received".equalsIgnoreCase(type)) {
            return reviewService.myReceivedReviews(kakaoId);
        }
        return reviewService.myWrittenReviews(kakaoId);
    }

    /** 특정 사용자에게 달린 리뷰 (프로필 공개 보기) */
    @GetMapping("/user/{userId}")
    public List<ReviewResponseDto> byUser(@PathVariable Long userId) {
        return reviewService.reviewsForUser(userId);
    }

    /** 상품에 달린 리뷰 (상품 상세) */
    @GetMapping("/product/{productId}")
    public List<ReviewResponseDto> byProduct(@PathVariable Long productId) {
        return reviewService.reviewsForProduct(productId);
    }

    /** 사용자 평점 요약 */
    @GetMapping("/user/{userId}/summary")
    public RatingSummaryDto userSummary(@PathVariable Long userId) {
        return reviewService.summaryForUser(userId);
    }

    /** 상품 평점 요약 */
    @GetMapping("/product/{productId}/summary")
    public RatingSummaryDto productSummary(@PathVariable Long productId) {
        return reviewService.summaryForProduct(productId);
    }
}
