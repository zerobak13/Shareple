package com.example.Shareple.controller;
import com.example.Shareple.repository.RentalRepository;
import com.example.Shareple.entity.Rental;
import com.example.Shareple.entity.RentalStatus;
import java.util.List;
import java.util.HashMap;

import com.example.Shareple.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.LocalDate;
import com.example.Shareple.repository.UserRepository;

// RentalController.java
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository; // ⬅️ 추가

    @PostMapping("/propose")
    public Rental propose(@AuthenticationPrincipal org.springframework.security.oauth2.core.user.OAuth2User me,
                          @RequestParam Long roomId,
                          @RequestParam Long productId,
                          @RequestParam Long borrowerId,
                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                          @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                          @RequestParam int deposit) {

        // 로그인 사용자 → kakaoId → User PK
        String ownerKakaoId = me.getAttribute("id").toString();
        Long ownerId = userRepository.findByKakaoId(ownerKakaoId)
                .orElseThrow(() -> new IllegalArgumentException("소유자 사용자 없음"))
                .getId();

        // ⬇️ 서비스 시그니처와 순서 맞춤 (ownerId, productId, roomId, borrowerId, ...)
        return rentalService.propose(ownerId, productId, roomId, borrowerId, startDate, endDate, deposit);
    }

    @PostMapping("/{id}/accept")
    public void accept(@AuthenticationPrincipal org.springframework.security.oauth2.core.user.OAuth2User me,
                       @PathVariable Long id) {
        String kakaoId = me.getAttribute("id").toString();
        Long borrowerId = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new IllegalArgumentException("대여자 사용자 없음")).getId();
        rentalService.accept(id, borrowerId);
    }

    @PostMapping("/{id}/reject")
    public void reject(@AuthenticationPrincipal org.springframework.security.oauth2.core.user.OAuth2User me,
                       @PathVariable Long id) {
        String kakaoId = me.getAttribute("id").toString();
        Long borrowerId = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new IllegalArgumentException("대여자 사용자 없음")).getId();
        rentalService.reject(id, borrowerId);
    }

    @PostMapping("/{id}/complete")
    public void complete(@AuthenticationPrincipal org.springframework.security.oauth2.core.user.OAuth2User me,
                         @PathVariable Long id) {
        String kakaoId = me.getAttribute("id").toString();
        Long userId = userRepository.findByKakaoId(kakaoId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음")).getId();
        rentalService.complete(id, userId);
    }


    // RentalController.java
    @GetMapping("/room/{roomId}/current")
    public Map<String, Object> current(@PathVariable Long roomId,
                                       @AuthenticationPrincipal com.example.Shareple.entity.User me) {
        // 가장 최신의 PENDING/ACTIVE를 반환 (없으면 null)
        Rental r = rentalRepository.findTopByChatRoomIdAndStatusInOrderByIdDesc(
                roomId, List.of(RentalStatus.PENDING, RentalStatus.ACTIVE)
        ).orElse(null);

        Map<String, Object> resp = new HashMap<>();
        if (r == null) { resp.put("status", "NONE"); return resp; }

        resp.put("status", r.getStatus().name());   // PENDING | ACTIVE
        resp.put("rentalId", r.getId());
        resp.put("productId", r.getProduct().getId());
        resp.put("ownerId", r.getOwner().getId());
        resp.put("borrowerId", r.getBorrower().getId());
        return resp;
    }


}
