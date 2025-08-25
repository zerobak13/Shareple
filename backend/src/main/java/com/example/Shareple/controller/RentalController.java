package com.example.Shareple.controller;

import com.example.Shareple.dto.RentalDto;
import com.example.Shareple.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @GetMapping("/mine")
    public List<RentalDto> getMyRentals(@AuthenticationPrincipal OAuth2User user) {
        String kakaoId = user.getAttribute("id").toString();
        return rentalService.findRentalsByKakaoId(kakaoId);
    }
}
